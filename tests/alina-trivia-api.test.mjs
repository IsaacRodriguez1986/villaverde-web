import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { after, beforeEach, test } from 'node:test';
import ts from 'typescript';

// All database traffic is synthetic. These tests never use the project's env files.
process.env.SUPABASE_URL = 'https://database.invalid';
process.env.SUPABASE_SERVICE_KEY = 'synthetic-trivia-test-secret';
const source = await readFile(new URL('../src/app/api/alina-trivia/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { GET, POST } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const version = 'alina-8-v1';
const correct = {
  '1': 'rosa', '2': 'chilaquiles', '3': 'uvas', '4': 'charles-ans',
  '5': 'visita', '7': 'videos', '8': 'cerditos', '9': 'suiza',
};
const correctAnswers = Object.entries(correct).map(([questionId, optionId]) => ({ questionId, optionId }));
const nativeFetch = globalThis.fetch;
let calls;
let database;

beforeEach(() => {
  calls = [];
  database = async (rpc, body) => {
    if (rpc === 'check_rate_limit') return Response.json(true);
    if (rpc === 'alina_trivia_board') return Response.json({ leaderboard: [], totalPlayers: 0 });
    if (rpc === 'alina_trivia_submit') return Response.json({
      result: { name: body.p_name, score: body.p_score, correctCount: body.p_correct_count, totalQuestions: 8, rank: 1 },
      leaderboard: [{ name: body.p_name, score: body.p_score, rank: 1 }], totalPlayers: 1,
    });
    throw new Error('Unexpected RPC in isolated test: ' + rpc);
  };
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, 'https://database.invalid', 'tests must not reach a real database or external service');
    const rpc = parsed.pathname.split('/').at(-1);
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ rpc, body, options });
    return database(rpc, body);
  };
});
after(() => { globalThis.fetch = nativeFetch; });

const valid = (patch = {}) => ({
  version, attemptId: randomUUID(), name: 'Invitada de prueba',
  answers: structuredClone(correctAnswers), ...patch,
});
const get = () => GET(new Request('https://example.test/api/alina-trivia'));
const request = (body, headers = {}) => new Request('https://example.test/api/alina-trivia', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const post = (body = valid(), headers) => POST(request(body, headers));
const submissions = () => calls.filter(call => call.rpc === 'alina_trivia_submit');

test('GET publishes the eight ready questions and current shared board without the answer key', async () => {
  const board = {
    leaderboard: [{ name: 'Invitada A', score: 800, rank: 1 }, { name: 'Invitado B', score: 800, rank: 1 }, { name: 'Invitada C', score: 700, rank: 3 }],
    totalPlayers: 3,
  };
  database = async rpc => {
    assert.equal(rpc, 'alina_trivia_board');
    return Response.json(board);
  };
  const response = await get();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control') || '', /no-store/i, 'a public shared ranking cannot be a stale cache');
  const data = await response.json();
  assert.equal(data.version, version);
  assert.equal(data.pointsPerCorrect, 100);
  assert.deepEqual(data.questions.map(question => question.id), Object.keys(correct));
  for (const question of data.questions) {
    assert.equal(typeof question.text, 'string');
    assert.ok(question.text.length > 0);
    assert.equal(question.options.length, 4, 'each question offers the agreed four options');
    assert.equal(new Set(question.options.map(option => option.id)).size, 4);
    assert.ok(question.options.some(option => option.id === correct[question.id]));
    for (const option of question.options) assert.equal(typeof option.text, 'string');
  }
  const inspect = node => {
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      assert.doesNotMatch(key, /^(?:correct|correctAnswer|correctOption|correctOptionId|answerKey|answers)$/i, 'GET must not reveal which choice is correct');
      inspect(value);
    }
  };
  inspect(data.questions);
  assert.deepEqual(data.leaderboard, board.leaderboard, 'shared ranks, including ties, come from the database');
  assert.equal(data.totalPlayers, board.totalPlayers);
  assert.deepEqual(calls[0].body, { p_quiz_version: version });
});

test('POST calculates 800, 700, and zero points on the server and ignores a forged client score', async () => {
  const publicQuestions = (await (await get()).json()).questions;
  const wrong = questionId => publicQuestions.find(question => question.id === questionId).options.find(option => option.id !== correct[questionId]).id;
  const cases = [
    { count: 8, answers: correctAnswers },
    { count: 7, answers: correctAnswers.map((answer, index) => index === 0 ? { ...answer, optionId: wrong(answer.questionId) } : answer) },
    { count: 0, answers: correctAnswers.map(answer => ({ ...answer, optionId: wrong(answer.questionId) })) },
  ];
  for (const scenario of cases) {
    calls = [];
    const body = valid({ answers: scenario.answers, score: 999999, correctCount: 999, rank: 1 });
    const response = await post(body);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.version, version);
    assert.equal(data.result.score, scenario.count * 100);
    assert.equal(data.result.correctCount, scenario.count);
    assert.equal(data.result.totalQuestions, 8);
    assert.equal(data.totalPlayers, 1);
    assert.deepEqual(calls.map(call => call.rpc), ['check_rate_limit', 'alina_trivia_submit']);
    const { body: stored } = submissions()[0];
    assert.equal(stored.p_attempt_id, body.attemptId, 'the same attempt identifier reaches atomic storage');
    assert.equal(stored.p_quiz_version, version);
    assert.equal(stored.p_name, body.name);
    assert.equal(stored.p_score, scenario.count * 100);
    assert.equal(stored.p_correct_count, scenario.count);
    assert.deepEqual(stored.p_answers, scenario.answers);
    assert.equal(calls[0].body.p_max, 10);
    assert.equal(calls[0].body.p_window_seconds, 600);
  }
});

test('POST validates names, attempt/version, and exactly one available option for every ready question', async () => {
  const invalid = [
    ...['', '   ', 'A', 'A'.repeat(33), null, 42, []].map(name => ({ label: 'name ' + JSON.stringify(name), patch: { name } })),
    { label: 'unknown version', patch: { version: 'alina-10-v0' } },
    { label: 'missing version', patch: { version: undefined } },
    { label: 'invalid attempt', patch: { attemptId: 'not-a-uuid' } },
    { label: 'missing attempt', patch: { attemptId: undefined } },
    { label: 'missing answers', patch: { answers: undefined } },
    { label: 'answers must be an array', patch: { answers: {} } },
    { label: 'incomplete answers', patch: { answers: correctAnswers.slice(0, 7) } },
    { label: 'extra answer', patch: { answers: [...correctAnswers, { questionId: '10', optionId: 'pending' }] } },
    { label: 'duplicate question', patch: { answers: [...correctAnswers.slice(0, 7), correctAnswers[0]] } },
    { label: 'pending question 6', patch: { answers: [...correctAnswers.slice(0, 7), { questionId: '6', optionId: 'pending' }] } },
    { label: 'pending question 10', patch: { answers: [...correctAnswers.slice(0, 7), { questionId: '10', optionId: 'pending' }] } },
    { label: 'unknown question', patch: { answers: [...correctAnswers.slice(0, 7), { questionId: '99', optionId: 'suiza' }] } },
    { label: 'foreign option', patch: { answers: correctAnswers.map((answer, index) => index ? answer : { ...answer, optionId: 'chilaquiles' }) } },
    { label: 'missing option', patch: { answers: correctAnswers.map((answer, index) => index ? answer : { questionId: answer.questionId }) } },
    { label: 'numeric option', patch: { answers: correctAnswers.map((answer, index) => index ? answer : { ...answer, optionId: 0 }) } },
    { label: 'null answer', patch: { answers: [...correctAnswers.slice(0, 7), null] } },
  ];
  for (const { label, patch } of invalid) {
    calls = [];
    const response = await post(valid(patch));
    assert.equal(response.status, 400, label);
    assert.equal(submissions().length, 0, label + ' cannot create a leaderboard entry');
    assert.equal(typeof (await response.json()).error, 'string', label + ' has a readable failure');
  }
  const response = await post(valid({ name: '  María José  ' }));
  assert.equal(response.status, 200);
  assert.equal(submissions()[0].body.p_name, 'María José', 'Spanish names are accepted and trimmed');
});

test('POST rejects cross-site, malformed, non-JSON, and oversized bodies before storing anything', async () => {
  const cases = [
    { label: 'foreign origin', body: valid(), headers: { origin: 'https://evil.invalid' }, status: 403 },
    { label: 'cross-site browser request', body: valid(), headers: { 'sec-fetch-site': 'cross-site' }, status: 403 },
    { label: 'malformed JSON', body: '{broken', status: 400 },
    { label: 'array body', body: '[]', status: 400 },
    { label: 'null body', body: 'null', status: 400 },
    { label: 'non-JSON', body: valid(), headers: { 'content-type': 'text/plain' }, status: 415 },
    { label: 'oversized body', body: valid({ padding: 'x'.repeat(100 * 1024) }), status: 413 },
    { label: 'oversized declared length', body: valid(), headers: { 'content-length': String(100 * 1024) }, status: 413 },
  ];
  for (const scenario of cases) {
    calls = [];
    assert.equal((await post(scenario.body, scenario.headers)).status, scenario.status, scenario.label);
    assert.equal(submissions().length, 0, scenario.label + ' cannot store a result');
  }
});

test('a shared rate limit stops writes and is checked before the result mutation', async () => {
  database = async rpc => {
    assert.equal(rpc, 'check_rate_limit');
    return Response.json(false);
  };
  const response = await post();
  assert.equal(response.status, 429);
  assert.equal(typeof (await response.json()).error, 'string');
  assert.equal(submissions().length, 0);
  assert.equal(calls.length, 1);
});

test('a conflicting saved attempt returns a safe conflict instead of replacing its result', async () => {
  database = async rpc => rpc === 'check_rate_limit' ? Response.json(true) : Response.json({
    code: '23505', message: 'attempt_conflict', details: 'private constraint alina_trivia_results_pkey',
  }, { status: 409 });
  const response = await post();
  assert.equal(response.status, 409);
  const data = await response.json();
  assert.equal(typeof data.error, 'string');
  assert.equal(data.result, undefined);
  assert.ok(!JSON.stringify(data).includes('alina_trivia_results_pkey'));
  assert.equal(submissions().length, 1, 'a conflict is not retried as a new attempt');
});

test('database and network failures return safe errors without private details or fabricated success', async () => {
  const privateDetail = 'postgres-password=synthetic-private-detail table alina_trivia_attempts';
  for (const failure of ['database', 'network']) {
    database = async rpc => {
      if (rpc === 'check_rate_limit') return Response.json(true);
      if (failure === 'network') throw new Error(privateDetail);
      return Response.json({ code: 'XX000', message: privateDetail, details: 'synthetic-trivia-test-secret' }, { status: 500 });
    };
    for (const action of [get, post]) {
      const response = await action();
      assert.ok(response.status >= 500, failure + ' has a failure HTTP status');
      const data = await response.json();
      assert.equal(typeof data.error, 'string');
      assert.equal(data.result, undefined, 'a storage failure cannot claim to save a score');
      const raw = JSON.stringify(data);
      for (const secret of [privateDetail, 'synthetic-trivia-test-secret', 'alina_trivia_attempts']) assert.ok(!raw.includes(secret));
    }
  }
});
