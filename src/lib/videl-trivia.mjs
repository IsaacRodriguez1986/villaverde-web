// Server-only Videl trivia. Scores and first-result timestamps never come from
// the browser. The Node tests use isolated temporary files and mocked REST only.
import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ANSWER_KEY = Object.freeze([1, 2, 0, 2, 1, 0, 2, 1, 0, 1]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BODY_LIMIT = 4096;
const QUEUES = Symbol.for('villaverde.videl-trivia.file-queues.v1');
const RATE = Symbol.for('villaverde.videl-trivia.rate.v1');
const queues = globalThis[QUEUES] ||= new Map();
const rates = globalThis[RATE] ||= new Map();

export class TriviaError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function validateParticipantId(value) {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new TriviaError(400, 'El identificador de participante no es válido.');
  }
  return value.toLowerCase();
}

function validName(value) {
  if (typeof value !== 'string') throw new TriviaError(400, 'Escribe tu nombre.');
  const name = value.trim().normalize('NFC').replace(/\s+/gu, ' ');
  if (!name || [...name].length > 50 || /[\u0000-\u001f\u007f]/u.test(name)) {
    throw new TriviaError(400, 'El nombre debe tener entre 1 y 50 caracteres.');
  }
  return name;
}

export function calculateScore(answers) {
  if (!Array.isArray(answers) || answers.length !== ANSWER_KEY.length ||
      !answers.every(answer => Number.isInteger(answer) && answer >= 0 && answer <= 2)) {
    throw new TriviaError(400, 'Contesta las diez preguntas antes de enviar.');
  }
  return answers.reduce((score, answer, index) => score + Number(answer === ANSWER_KEY[index]), 0);
}

export function validateSubmission(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TriviaError(400, 'El resultado no es válido.');
  }
  const participantId = validateParticipantId(value.participantId);
  const name = validName(value.name);
  const score = calculateScore(value.answers);
  return { participantId, name, score };
}

export function rankRows(rows, participantId = null) {
  const sorted = [...rows].sort((a, b) => b.score - a.score ||
    a.finishedAt.localeCompare(b.finishedAt) || a.participantId.localeCompare(b.participantId));
  const publicRow = (row, index) => ({ rank: index + 1, name: row.name, score: row.score });
  const ownIndex = participantId ? sorted.findIndex(row => row.participantId === participantId) : -1;
  return {
    total: sorted.length,
    top20: sorted.slice(0, 20).map(publicRow),
    me: ownIndex < 0 ? null : publicRow(sorted[ownIndex], ownIndex),
  };
}

async function acquireFileLock(filePath) {
  const lockPath = filePath + '.lock';
  const deadline = Date.now() + 5000;
  await mkdir(dirname(filePath), { recursive: true });
  while (true) {
    try {
      const handle = await open(lockPath, 'wx', 0o600);
      try { await handle.writeFile(JSON.stringify({ pid: process.pid })); }
      finally { await handle.close(); }
      return async () => { await unlink(lockPath).catch(error => { if (error.code !== 'ENOENT') throw error; }); };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      // A crashed local process must not leave the invitation locked forever.
      // A living owner is never displaced, even if its operation is slow.
      try {
        const owner = JSON.parse(await readFile(lockPath, 'utf8'));
        let alive = true;
        try { process.kill(owner.pid, 0); } catch (error) { alive = error.code !== 'ESRCH'; }
        if (!alive) { await unlink(lockPath); continue; }
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        const info = await stat(lockPath).catch(() => null);
        if (info && Date.now() - info.mtimeMs > 30000) { await unlink(lockPath); continue; }
      }
      if (Date.now() >= deadline) throw new TriviaError(503, 'El registro está ocupado. Intenta de nuevo.');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
}

async function withLocalLock(filePath, action) {
  const path = resolve(filePath);
  const previous = queues.get(path) || Promise.resolve();
  const operation = previous.then(async () => {
    const release = await acquireFileLock(path);
    try { return await action(path); } finally { await release(); }
  });
  const settled = operation.catch(() => {});
  queues.set(path, settled);
  settled.finally(() => { if (queues.get(path) === settled) queues.delete(path); });
  return operation;
}

async function readRows(filePath) {
  let document;
  try { document = JSON.parse(await readFile(filePath, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return [];
    throw new TriviaError(503, 'El registro no está disponible.');
  }
  if (document.version !== 1 || !Array.isArray(document.rows)) {
    throw new TriviaError(503, 'El registro no está disponible.');
  }
  const ids = new Set();
  for (const row of document.rows) {
    if (!row || !UUID.test(row.participantId) || ids.has(row.participantId) ||
        typeof row.name !== 'string' || !row.name || [...row.name].length > 50 ||
        !Number.isInteger(row.score) || row.score < 0 || row.score > 10 ||
        typeof row.finishedAt !== 'string' || Number.isNaN(Date.parse(row.finishedAt))) {
      throw new TriviaError(503, 'El registro no está disponible.');
    }
    ids.add(row.participantId);
  }
  return document.rows;
}

async function writeRows(filePath, rows) {
  const temporary = filePath + '.' + process.pid + '.' + randomUUID() + '.tmp';
  try {
    await writeFile(temporary, JSON.stringify({ version: 1, rows }), { mode: 0o600 });
    await rename(temporary, filePath);
  } finally { await unlink(temporary).catch(() => {}); }
}

export function createLocalStore({ filePath, now = () => new Date().toISOString() }) {
  return {
    snapshot(participantId = null) {
      return withLocalLock(filePath, async path => rankRows(await readRows(path), participantId));
    },
    record(submission) {
      const validated = validateSubmission(submission);
      return withLocalLock(filePath, async path => {
        const rows = await readRows(path);
        const recorded = !rows.some(row => row.participantId === validated.participantId);
        if (recorded) {
          rows.push({ ...validated, finishedAt: now() });
          await writeRows(path, rows);
        }
        return { ...rankRows(rows, validated.participantId), recorded };
      });
    },
  };
}

// Explicit local smoke-test cleanup. This is not exposed through the API and
// cannot target production. Only the exact supplied test UUIDs are removed.
export async function removeLocalTestRows(filePath, participantIds) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('Local test cleanup is unavailable in production.');
  }
  const ids = new Set(participantIds.map(validateParticipantId));
  return withLocalLock(filePath, async path => {
    const rows = await readRows(path);
    const retained = rows.filter(row => !ids.has(row.participantId));
    await writeRows(path, retained);
    return rows.length - retained.length;
  });
}

function publicSnapshot(value) {
  const row = item => {
    if (!item || !Number.isSafeInteger(item.rank) || item.rank < 1 ||
        typeof item.name !== 'string' || !Number.isInteger(item.score) || item.score < 0 || item.score > 10) {
      throw new TriviaError(503, 'El ranking no está disponible.');
    }
    return { rank: item.rank, name: item.name, score: item.score };
  };
  if (!value || !Number.isSafeInteger(value.total) || value.total < 0 || !Array.isArray(value.top20)) {
    throw new TriviaError(503, 'El ranking no está disponible.');
  }
  return { total: value.total, top20: value.top20.slice(0, 20).map(row), me: value.me ? row(value.me) : null };
}

export function createSupabaseStore({ url, key, fetchImpl = fetch }) {
  const base = url.replace(/\/$/, '') + '/rest/v1/';
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  async function call(path, body, prefer) {
    let response;
    try {
      response = await fetchImpl(base + path, {
        method: 'POST', headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
        body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(8000),
      });
    } catch { throw new TriviaError(503, 'El registro no está disponible. Intenta de nuevo.'); }
    if (!response.ok) throw new TriviaError(503, 'El registro no está disponible. Intenta de nuevo.');
    try { return await response.json(); }
    catch { throw new TriviaError(503, 'El registro no está disponible.'); }
  }
  async function snapshot(participantId = null) {
    return publicSnapshot(await call('rpc/videl_trivia_snapshot', { p_participant_id: participantId }));
  }
  return {
    snapshot,
    async record(submission) {
      const validated = validateSubmission(submission);
      const inserted = await call('videl_trivia_results?on_conflict=participant_id', {
        participant_id: validated.participantId, name: validated.name, score: validated.score,
      }, 'resolution=ignore-duplicates,return=representation');
      if (!Array.isArray(inserted)) throw new TriviaError(503, 'El registro no está disponible.');
      return { ...await snapshot(validated.participantId), recorded: inserted.length > 0 };
    },
  };
}

export function configuredStore(env = process.env, cwd = process.cwd(), fetchImpl = fetch) {
  // DEV is deliberately isolated, even when production Supabase env vars exist.
  if (env.NODE_ENV === 'development' && !env.VERCEL) {
    return createLocalStore({ filePath: resolve(cwd, '.local', 'videl-trivia.json') });
  }
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !env.SUPABASE_SERVICE_KEY) {
    throw new TriviaError(503, 'El ranking estará disponible cuando se active su registro.');
  }
  return createSupabaseStore({ url, key: env.SUPABASE_SERVICE_KEY, fetchImpl });
}

function rateLimited(request, method) {
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local').split(',')[0].trim();
  const key = method + ':' + ip.slice(0, 80);
  const now = Date.now();
  let item = rates.get(key);
  if (!item || now >= item.reset) {
    if (rates.size >= 5000) for (const [key, value] of rates) if (now >= value.reset) rates.delete(key);
    if (rates.size >= 5000 && !item) return true;
    item = { count: 0, reset: now + 60000 };
    rates.set(key, item);
  }
  item.count++;
  return item.count > (method === 'POST' ? 60 : 120);
}

async function readLimitedJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    throw new TriviaError(415, 'Envía el resultado como JSON.');
  }
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > BODY_LIMIT) throw new TriviaError(413, 'El resultado es demasiado grande.');
  if (!request.body) throw new TriviaError(400, 'El resultado no es válido.');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  let timer;
  try {
    const parse = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > BODY_LIMIT) throw new TriviaError(413, 'El resultado es demasiado grande.');
        chunks.push(value);
      }
      try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { throw new TriviaError(400, 'El resultado no es válido.'); }
    };
    return await Promise.race([parse(), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new TriviaError(408, 'El envío tardó demasiado. Intenta de nuevo.')), 4000);
    })]);
  } finally { clearTimeout(timer); void reader.cancel().catch(() => {}); }
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff', ...(status === 429 ? { 'Retry-After': '60' } : {}),
  } });
}

function sameOrigin(request) {
  const received = request.headers.get('origin');
  if (!received) return false;
  try {
    const actual = new URL(received);
    if (actual.origin !== received) return false;
    const url = new URL(request.url);
    // Next dev can normalize request.url to localhost while the browser uses
    // 127.0.0.1. Host is the actual requested host; never trust forwarded-host.
    const host = request.headers.get('host') || url.host;
    if (!/^[a-z0-9.:[\]-]+$/i.test(host)) return false;
    const forwardedProtocol = (request.headers.get('x-forwarded-proto') || '').split(',')[0].trim();
    const protocol = ['http', 'https'].includes(forwardedProtocol) ? forwardedProtocol + ':' : url.protocol;
    return actual.origin === new URL(protocol + '//' + host).origin;
  } catch { return false; }
}

export function createTriviaHandlers({ getStore = configuredStore, limited = rateLimited } = {}) {
  function fail(error) {
    return json({ error: error instanceof TriviaError ? error.message : 'El registro no está disponible. Intenta de nuevo.' },
                error instanceof TriviaError ? error.status : 503);
  }
  return {
    async GET(request) {
      try {
        if (limited(request, 'GET')) throw new TriviaError(429, 'Intenta de nuevo en un minuto.');
        if (request.url.length > 2048) throw new TriviaError(400, 'La solicitud no es válida.');
        const raw = new URL(request.url).searchParams.get('participantId');
        const participantId = raw === null ? null : validateParticipantId(raw);
        return json(await getStore().snapshot(participantId));
      } catch (error) { return fail(error); }
    },
    async POST(request) {
      try {
        if (!sameOrigin(request)) {
          throw new TriviaError(403, 'Abre la trivia desde la invitación para participar.');
        }
        if (limited(request, 'POST')) throw new TriviaError(429, 'Intenta de nuevo en un minuto.');
        const body = await readLimitedJson(request);
        validateSubmission(body);
        return json(await getStore().record(body));
      } catch (error) { return fail(error); }
    },
  };
}
