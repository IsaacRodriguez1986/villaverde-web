import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import {
  calculateScore, configuredStore, createLocalStore, createSupabaseStore,
  createTriviaHandlers, rankRows, removeLocalTestRows, TriviaError, validateSubmission,
} from '../src/lib/videl-trivia.mjs';

const correct = [1, 2, 0, 2, 1, 0, 2, 1, 0, 1];
const wrong = correct.map(answer => (answer + 1) % 3);
const id = value => '00000000-0000-4000-8000-' + String(value).padStart(12, '0');
const submission = (value, answers = correct) => ({ participantId: id(value), name: 'Prueba ' + value, answers });
const request = (body, headers = {}) => new Request('http://localhost/api/videl-trivia', {
  method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
async function temporary(t) {
  const temporaryRoot = resolve(tmpdir());
  const directory = await mkdtemp(join(temporaryRoot, 'videl-trivia-test-'));
  assert.equal(dirname(resolve(directory)), temporaryRoot);
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, filePath: join(directory, 'videl-trivia.json') };
}

test('server key scores all ten answers and ignores client score/timestamp', () => {
  assert.equal(calculateScore(correct), 10);
  assert.equal(calculateScore(wrong), 0);
  assert.equal(calculateScore([...correct.slice(0, 5), ...wrong.slice(5)]), 5);
  assert.deepEqual(validateSubmission({ ...submission(1), score: 999, finishedAt: '1900-01-01' }),
    { participantId: id(1), name: 'Prueba 1', score: 10 });
});

test('rejects incomplete, noninteger or out-of-range answers and invalid names/IDs', () => {
  for (const answers of [null, [], correct.slice(1), [...correct, 1], ['1', ...correct.slice(1)],
                         [3, ...correct.slice(1)], [-1, ...correct.slice(1)], [.5, ...correct.slice(1)]]) {
    assert.throws(() => validateSubmission({ ...submission(1), answers }), { status: 400 });
  }
  for (const name of ['', '  ', 'a'.repeat(51), null, 'A\u0000B']) {
    assert.throws(() => validateSubmission({ ...submission(1), name }), { status: 400 });
  }
  assert.throws(() => validateSubmission({ ...submission(1), participantId: 'short-id' }), { status: 400 });
  assert.equal(validateSubmission({ ...submission(1), name: '  María   José  ' }).name, 'María José');
});

test('ties use server timestamp then stable UUID, and never expose UUIDs', () => {
  const rows = [
    { participantId: id(3), name: 'Third', score: 8, finishedAt: '2026-10-09T15:00:00.000Z' },
    { participantId: id(2), name: 'Second', score: 8, finishedAt: '2026-10-09T14:00:00.000Z' },
    { participantId: id(1), name: 'First', score: 8, finishedAt: '2026-10-09T14:00:00.000Z' },
    { participantId: id(4), name: 'Winner', score: 10, finishedAt: '2026-10-09T16:00:00.000Z' },
  ];
  const ranked = rankRows(rows, id(3));
  assert.deepEqual(ranked.top20.map(row => row.name), ['Winner', 'First', 'Second', 'Third']);
  assert.deepEqual(ranked.me, { rank: 4, name: 'Third', score: 8 });
  assert.equal(JSON.stringify(ranked).includes('participantId'), false);
});

test('file snapshot counts more than 1000 and returns own rank outside top 20', async t => {
  const { filePath } = await temporary(t);
  const rows = Array.from({ length: 1005 }, (_, index) => ({ participantId: id(index + 1),
    name: 'Prueba ' + (index + 1), score: index === 1004 ? 0 : 10,
    finishedAt: '2026-10-09T14:00:00.000Z' }));
  await writeFile(filePath, JSON.stringify({ version: 1, rows }));
  const snapshot = await createLocalStore({ filePath }).snapshot(id(1005));
  assert.equal(snapshot.total, 1005);
  assert.equal(snapshot.top20.length, 20);
  assert.deepEqual(snapshot.me, { rank: 1005, name: 'Prueba 1005', score: 0 });
});

test('first result persists across a new store and retries cannot upgrade score/name', async t => {
  const { filePath } = await temporary(t);
  const first = await createLocalStore({ filePath, now: () => '2026-10-09T14:00:00.000Z' }).record(submission(1, wrong));
  assert.equal(first.recorded, true);
  const retry = await createLocalStore({ filePath }).record({ ...submission(1), name: 'Changed' });
  assert.equal(retry.recorded, false);
  assert.deepEqual(retry.me, { rank: 1, name: 'Prueba 1', score: 0 });
  const stored = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(stored.rows[0].finishedAt, '2026-10-09T14:00:00.000Z');
  assert.equal('answers' in stored.rows[0], false);
});

test('concurrent submissions and hot-module reload share locks and preserve all first results', async t => {
  const { filePath } = await temporary(t);
  const reloaded = await import('../src/lib/videl-trivia.mjs?hot-reload-test');
  const a = createLocalStore({ filePath });
  const b = reloaded.createLocalStore({ filePath });
  const sends = Array.from({ length: 25 }, (_, index) => (index % 2 ? a : b).record(
    submission(index + 1, index === 24 ? wrong : correct)));
  sends.push(...Array.from({ length: 12 }, () => b.record({ ...submission(25), name: 'Upgrade attempt' })));
  const results = await Promise.all(sends);
  assert.equal(results.filter(result => result.recorded).length, 25);
  const snapshot = await b.snapshot(id(25));
  assert.equal(snapshot.total, 25);
  assert.deepEqual(snapshot.me, { rank: 25, name: 'Prueba 25', score: 0 });
  assert.equal(snapshot.top20.length, 20);
  assert.equal(await stat(filePath + '.lock').then(() => true).catch(() => false), false);
});

test('cleanup removes only specified test UUIDs and retains unrelated rows', async t => {
  const { filePath } = await temporary(t);
  const store = createLocalStore({ filePath });
  await store.record(submission(1));
  await store.record({ ...submission(2), name: 'Keep this participant' });
  assert.equal(await removeLocalTestRows(filePath, [id(1)]), 1);
  assert.deepEqual((await store.snapshot(id(2))).me, { rank: 1, name: 'Keep this participant', score: 10 });
});

test('independent Node processes serialize overlapping results through the file lock', async t => {
  const { filePath } = await temporary(t);
  const moduleUrl = new URL('../src/lib/videl-trivia.mjs', import.meta.url).href;
  const code = `
    const { createLocalStore } = await import(${JSON.stringify(moduleUrl)});
    const store = createLocalStore({filePath:process.argv[1]});
    const start = Number(process.argv[2]);
    await Promise.all(Array.from({length:12},(_,i)=>store.record({
      participantId:'00000000-0000-4000-8000-'+String(start+i).padStart(12,'0'),
      name:'Process test '+(start+i),answers:[1,2,0,2,1,0,2,1,0,1]
    })));`;
  const worker = start => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code, filePath, String(start)],
      { stdio: ['ignore', 'ignore', 'pipe'] });
    let error = '';
    child.stderr.on('data', chunk => { error += chunk.toString(); });
    child.on('error', reject);
    child.on('exit', status => status === 0 ? resolve() : reject(new Error(error || 'Worker failed')));
  });
  await Promise.all([worker(1), worker(7)]);
  const snapshot = await createLocalStore({ filePath }).snapshot(id(18));
  assert.equal(snapshot.total, 18);
  assert.equal(snapshot.top20.length, 18);
  assert.equal(snapshot.me.score, 10);
  assert.equal(JSON.parse(await readFile(filePath, 'utf8')).rows.length, 18);
});

test('corrupt storage fails closed without resetting or overwriting data', async t => {
  const { filePath } = await temporary(t);
  await writeFile(filePath, '{broken');
  await assert.rejects(createLocalStore({ filePath }).record(submission(1)), { status: 503 });
  assert.equal(await readFile(filePath, 'utf8'), '{broken');
});

test('development is always local even if Supabase credentials are configured', async t => {
  const { directory } = await temporary(t);
  const store = configuredStore({ NODE_ENV: 'development', SUPABASE_URL: 'https://example.invalid',
    SUPABASE_SERVICE_KEY: 'fake-test-key' }, directory, () => { throw new Error('must never call network'); });
  assert.equal((await store.record(submission(1))).recorded, true);
  assert.equal((await store.snapshot()).total, 1);
  assert.equal(await stat(join(directory, '.local', 'videl-trivia.json')).then(() => true), true);
});

test('production/Vercel without Supabase fails 503 with no ephemeral fallback', () => {
  assert.throws(() => configuredStore({ NODE_ENV: 'production' }), { status: 503 });
  assert.throws(() => configuredStore({ NODE_ENV: 'development', VERCEL: '1' }), { status: 503 });
});

test('production accepts the existing public project URL but requires the server key', async () => {
  const env = { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid',
    SUPABASE_SERVICE_KEY: 'fake-test-server-key' };
  const store = configuredStore(env, undefined, async (url, init) => {
    assert.equal(url, 'https://example.invalid/rest/v1/rpc/videl_trivia_snapshot');
    assert.equal(init.headers.apikey, 'fake-test-server-key');
    return Response.json({ total: 0, top20: [], me: null });
  });
  assert.equal((await store.snapshot()).total, 0);
  assert.throws(() => configuredStore({ NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY: 'fake-public-key' }), { status: 503 });
});

test('Supabase uses ignore-duplicates and one complete SQL snapshot without client UUID leaks', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (url.includes('/rpc/')) return Response.json({ total: 1025,
      top20: [{ rank: 1, name: 'Winner', score: 10, participant_id: id(5) }],
      me: { rank: 1025, name: 'Prueba 1', score: 0, participant_id: id(1) } });
    return Response.json(calls.length === 1 ? [{ participant_id: id(1) }] : []);
  };
  const store = createSupabaseStore({ url: 'https://example.invalid', key: 'fake-test-key', fetchImpl });
  const first = await store.record({ ...submission(1, wrong), score: 100, finished_at: '1900-01-01' });
  assert.equal(first.recorded, true);
  assert.equal(first.total, 1025);
  assert.equal(first.me.rank, 1025);
  assert.deepEqual(JSON.parse(calls[0].init.body), { participant_id: id(1), name: 'Prueba 1', score: 0 });
  assert.equal(calls[0].init.headers.Prefer, 'resolution=ignore-duplicates,return=representation');
  assert.deepEqual(JSON.parse(calls[1].init.body), { p_participant_id: id(1) });
  assert.equal(JSON.stringify(first).includes('participant_id'), false);
  const retry = await store.record(submission(1));
  assert.equal(retry.recorded, false);
  assert.equal(retry.me.score, 0);
});

test('GET/POST handlers return consistent ranks, no-store and idempotent result', async t => {
  const { filePath } = await temporary(t);
  const store = createLocalStore({ filePath });
  const handlers = createTriviaHandlers({ getStore: () => store, limited: () => false });
  const first = await handlers.POST(request(submission(1)));
  assert.equal(first.status, 200);
  assert.equal((await first.json()).recorded, true);
  assert.match(first.headers.get('cache-control'), /no-store/);
  const retry = await handlers.POST(request(submission(1, wrong)));
  assert.equal((await retry.json()).recorded, false);
  const read = await handlers.GET(new Request('http://localhost/api/videl-trivia?participantId=' + id(1)));
  assert.deepEqual((await read.json()).me, { rank: 1, name: 'Prueba 1', score: 10 });
});

test('origin uses actual Host when Next dev normalizes the URL to localhost', async t => {
  const { filePath } = await temporary(t);
  const handlers = createTriviaHandlers({ getStore: () => createLocalStore({ filePath }), limited: () => false });
  const accepted = await handlers.POST(request(submission(1), {
    host: '127.0.0.1:3091', origin: 'http://127.0.0.1:3091',
  }));
  assert.equal(accepted.status, 200);
  const rejected = await handlers.POST(request(submission(2), {
    host: '127.0.0.1:3091', origin: 'http://localhost:3091',
  }));
  assert.equal(rejected.status, 403);
  const remote = await handlers.POST(request(submission(2), {
    host: 'invite.example', origin: 'https://invite.example', 'x-forwarded-proto': 'https',
  }));
  assert.equal(remote.status, 200);
});

test('origin, byte limit, malformed JSON, media type and invalid query are rejected before storage', async () => {
  const handlers = createTriviaHandlers({ getStore: () => { throw new Error('should not reach storage'); }, limited: () => false });
  assert.equal((await handlers.POST(request(submission(1), { origin: 'https://other.invalid' }))).status, 403);
  const missingOrigin = request(submission(1)); missingOrigin.headers.delete('origin');
  assert.equal((await handlers.POST(missingOrigin)).status, 403);
  assert.equal((await handlers.POST(request('x'.repeat(4097)))).status, 413);
  assert.equal((await handlers.POST(request('{broken'))).status, 400);
  assert.equal((await handlers.POST(request(submission(1), { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await handlers.GET(new Request('http://localhost/api/videl-trivia?participantId=bad'))).status, 400);
});

test('rate limit and storage errors return controlled responses without secret details', async () => {
  const limited = createTriviaHandlers({ limited: () => true });
  const response = await limited.GET(new Request('http://localhost/api/videl-trivia'));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
  const broken = createTriviaHandlers({ getStore: () => { throw new Error('private credential should not leak'); }, limited: () => false });
  const failure = await broken.POST(request(submission(1)));
  assert.equal(failure.status, 503);
  assert.equal((await failure.text()).includes('credential'), false);
});
