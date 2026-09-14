// Offline adversarial integration tests against the real route, with a mocked Supabase.
// Run: node --test scripts/eventus-security.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

const routePath = path.resolve(__dirname, '../src/app/api/eventus/route.ts');
const source = fs.readFileSync(routePath, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const secret = 'offline-test-service-key-at-least-256-bits';
function token(scope = 'event', code = 'VV-TEST', guestId, exp = Math.floor(Date.now() / 1000) + 3600) {
  const payload = Buffer.from(JSON.stringify({ scope, code, guestId, exp, nonce: crypto.randomBytes(16).toString('hex') })).toString('base64url');
  return 'ev1.' + payload + '.' + crypto.createHmac('sha256', secret).update('eventus-v1.' + payload).digest('base64url');
}
function setup() {
  process.env.SUPABASE_URL = 'https://supabase.test';
  process.env.SUPABASE_SERVICE_KEY = secret;
  process.env.DASH_PASSWORD = 'offline-admin-password';
  delete process.env.EVENTUS_ACCESS_SECRET;
  const m = new Module(routePath, module);
  m.filename = routePath;
  m.paths = module.paths;
  m._compile(compiled, routePath);
  const data = {
    eventus_events: [{ code: 'VV-TEST', name: 'Test event', phone: '5512345678', date: '2027-01-01', type: 'xv' }, { code: 'VV-OTHER', name: 'Private other event' }],
    eventus_guests: [{ id: 1, event_code: 'VV-TEST', name: 'Guest one', status: 'pending' }, { id: 2, event_code: 'VV-OTHER', name: 'Private guest', status: 'pending' }],
    eventus_payments: [{ id: 1, event_code: 'VV-TEST', name: 'Deposit', paid: false, amount: 3000 }],
    eventus_checklist: [], eventus_program: [],
  };
  const state = { calls: [], allowed: true, databaseAvailable: true, data };
  global.fetch = async (address, options = {}) => {
    const url = new URL(address);
    assert.equal(url.origin, 'https://supabase.test', 'No external network allowed in tests');
    const method = options.method || 'GET';
    const body = options.body == null ? null : (Buffer.isBuffer(options.body) ? options.body : JSON.parse(options.body));
    state.calls.push({ url, method, body });
    if (!state.databaseAvailable) return new Response('unavailable', { status: 503 });
    if (url.pathname.endsWith('/rpc/check_rate_limit')) return Response.json(state.allowed);
    if (url.pathname.startsWith('/storage/v1/object/sign/')) return Response.json({ signedURL: '/object/sign/' + url.pathname.split('/sign/')[1] + '?token=offline-signed-photo' });
    if (url.pathname.startsWith('/storage/v1/object/eventus-photos/')) return Response.json({ Key: url.pathname });
    const table = url.pathname.split('/').pop();
    assert.ok(Object.hasOwn(data, table), 'Only expected tables are called');
    const matching = row => ['id', 'code', 'event_code'].every(key => !url.searchParams.has(key) || String(row[key]) === url.searchParams.get(key).slice(3));
    let rows = data[table].filter(matching);
    if (method === 'POST') {
      rows = (Array.isArray(body) ? body : [body]).map(row => ({ id: data[table].length + 10, ...row }));
      data[table].push(...rows);
    }
    if (method === 'PATCH') rows.forEach(row => Object.assign(row, body));
    if (method === 'DELETE') data[table] = data[table].filter(row => !matching(row));
    if (url.searchParams.has('limit')) rows = rows.slice(0, Number(url.searchParams.get('limit')));
    const selected = url.searchParams.get('select')?.split(',');
    return Response.json(rows.map(row => selected ? Object.fromEntries(selected.filter(k => k in row).map(k => [k, row[k]])) : row));
  };
  function post(body, headers = {}) {
    return m.exports.POST(new Request('https://web.test/api/eventus', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://web.test', ...headers }, body: JSON.stringify(body) }));
  }
  return { ...m.exports, state, post };
}
const read = (accessToken, table = 'eventus_events', query = 'code=eq.VV-TEST') => ({ op: 'db', method: 'GET', table, query, accessToken });

test('bare codes, phone recovery, and old anonymous register cannot query the database', async () => {
  const { post, state } = setup();
  for (const query of ['code=eq.VV-TEST', 'or=(phone.eq.5512345678)&select=code,name&limit=1']) {
    assert.equal((await post({ ...read(undefined, 'eventus_events', query), code: 'VV-TEST' })).status, 401);
  }
  assert.equal((await post({ op: 'db', table: 'eventus_events', method: 'POST', body: { code: 'VV-TEST' } })).status, 401);
  assert.equal(state.calls.length, 0);
});
test('tampered, expired, unknown-scope tokens and raw admin passwords are denied', async () => {
  const { post, state } = setup();
  for (const value of [token() + 'x', token('event', 'VV-TEST', undefined, 1), token('guest', 'VV-TEST', '1'), token('admin')]) {
    assert.equal((await post(read(value))).status, 401);
  }
  assert.equal((await post({ ...read(undefined), adminPw: process.env.DASH_PASSWORD })).status, 401);
  assert.equal(state.calls.length, 0);
});
test('registration ignores privilege fields, generates identifiers and issues usable event token', async () => {
  const { post, state } = setup();
  const result = await post({ op: 'register', body: { name: 'New event', phone: '5512345678', type: 'xv', date: '2027-01-01', code: 'VV-OTHER', activated: true, total_cost: 9000 } });
  assert.equal(result.status, 201);
  const { code, accessToken } = await result.json();
  assert.match(code, /^VV-[A-F0-9]{32}$/);
  assert.equal(state.data.eventus_events.at(-1).activated, false);
  assert.equal(state.data.eventus_events.at(-1).total_cost, 0);
  const loaded = await post(read(accessToken, 'eventus_events', 'code=eq.' + code));
  assert.equal(loaded.status, 200);
  assert.equal((await loaded.json())[0].code, code);
});
test('PostgREST embeds, OR filters, duplicate scopes and cross-event selects are rejected', async () => {
  const { post, state } = setup();
  for (const query of ['event_code=eq.VV-TEST&select=*,eventus_events(*)', 'event_code=eq.VV-TEST&or=(event_code.eq.VV-OTHER)', 'event_code=eq.VV-TEST&event_code=eq.VV-OTHER', 'event_code=eq.VV-TEST&select=name,secret:eventus_events(*)']) {
    assert.equal((await post(read(token(), 'eventus_guests', query))).status, 400);
  }
  assert.equal((await post(read(token(), 'eventus_guests', 'event_code=eq.VV-OTHER'))).status, 403);
  assert.ok(state.calls.every(c => c.url.pathname.endsWith('/eventus_events')), 'No child query reaches Supabase');
});
test('clients cannot reparent rows, mark payments paid, or write across events', async () => {
  const { post, state } = setup();
  const write = (table, body, query = 'id=eq.1') => post({ op: 'db', method: 'PATCH', table, query, body, accessToken: token() });
  assert.equal((await write('eventus_guests', { event_code: 'VV-OTHER' })).status, 403);
  assert.equal((await write('eventus_payments', { paid: true })).status, 403);
  const cross = await write('eventus_guests', { name: 'Changed' }, 'id=eq.2');
  assert.equal(cross.status, 200);
  assert.deepEqual(await cross.json(), []);
  assert.equal(state.data.eventus_guests[1].name, 'Private guest');
  assert.equal(state.data.eventus_payments[0].paid, false);
  const call = state.calls.find(c => c.method === 'PATCH');
  assert.equal(call.url.searchParams.get('event_code'), 'eq.VV-TEST');
});
test('legitimate client reads and writes stay scoped and table columns are allowlisted', async () => {
  const { post, state } = setup();
  const res = await post(read(token(), 'eventus_guests', 'event_code=eq.VV-TEST&order=created_at'));
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).map(row => row.id), [1]);
  assert.ok(!state.calls.at(-1).url.searchParams.get('select').includes('*'));
  assert.equal((await post({ op: 'db', method: 'PATCH', table: 'eventus_guests', query: 'id=eq.1', body: { status: 'confirmed' }, accessToken: token() })).status, 200);
  assert.equal(state.data.eventus_guests[0].status, 'confirmed');
});
test('malformed briefs and extreme table counts cannot break administrator rendering', async () => {
  const { post, state } = setup();
  for (const body of [
    { num_mesas: 10000000 }, { num_mesas: 1.5 }, { num_mesas: 0 },
    { invitation_brief: { message: {} } }, { invitation_brief: { photos: 'not-an-array' } },
    { invitation_brief: { photos: ['javascript:alert(1)'] } },
    { invitation_brief: { code: 'VV-OTHER' } }, { event_time: '\" onfocus=alert(1)' },
    { menu_sel: { entradas: { nested: true } } },
  ]) {
    const response = await post({ op: 'db', method: 'PATCH', table: 'eventus_events', query: 'code=eq.VV-TEST', body, accessToken: token() });
    assert.equal(response.status, 400, JSON.stringify(body));
  }
  assert.ok(!state.calls.some(call => call.method === 'PATCH'));
  const response = await post({ op: 'db', method: 'PATCH', table: 'eventus_events', query: 'code=eq.VV-TEST', body: { num_mesas: 60, invitation_brief: { message: 'Gracias', carousel_photos: [] }, event_time: '18:30' }, accessToken: token() });
  assert.equal(response.status, 200);
});
test('guest invitation tokens authorize only their own RSVP and never event management', async () => {
  const { post, GET, PATCH, state } = setup();
  const issued = await post({ op: 'guest-token', code: 'VV-TEST', guestId: '1', accessToken: token() });
  const guestToken = (await issued.json()).token;
  assert.ok(guestToken);
  assert.equal((await post(read(guestToken))).status, 401);
  assert.equal((await GET(new Request('https://web.test/api/eventus?code=VV-TEST&guestId=1'))).status, 401);
  const allowed = await GET(new Request('https://web.test/api/eventus?code=VV-TEST&guestId=1', { headers: { Authorization: 'Bearer ' + guestToken } }));
  assert.equal(allowed.status, 200);
  const body = await allowed.json();
  assert.equal(body.guest.id, 1);
  assert.equal(body.event.phone, undefined);
  assert.equal((await GET(new Request('https://web.test/api/eventus?code=VV-OTHER&guestId=2', { headers: { Authorization: 'Bearer ' + guestToken } }))).status, 403);
  const changed = await PATCH(new Request('https://web.test/api/eventus', { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + guestToken }, body: JSON.stringify({ code: 'VV-TEST', guestId: '1', status: 'confirmed' }) }));
  assert.equal(changed.status, 200);
  assert.equal(state.data.eventus_guests[0].status, 'confirmed');
  assert.equal(state.data.eventus_guests[1].status, 'pending');
});
test('unknown and duplicate legacy codes cannot issue access', async () => {
  const { post, state } = setup();
  assert.equal((await post({ op: 'access', accessToken: token('event', 'VV-NONE') })).status, 404);
  state.data.eventus_events.push({ code: 'VV-TEST' });
  assert.equal((await post({ op: 'access', accessToken: token() })).status, 404);
});
test('admin cookie is HttpOnly, origin checked, rate limited and can issue migration links', async () => {
  const { post, state } = setup();
  assert.equal((await post({ op: 'auth', adminPw: 'wrong' })).status, 401);
  const login = await post({ op: 'auth', adminPw: process.env.DASH_PASSWORD });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; SameSite=Strict; Max-Age=28800; Secure/);
  assert.ok(!JSON.stringify(await login.json()).includes('ev1.'));
  const headers = { cookie: cookie.split(';')[0] };
  const issued = await post({ op: 'issue-access', code: 'VV-TEST' }, headers);
  assert.equal(issued.status, 200);
  const accessToken = (await issued.json()).accessToken;
  assert.equal((await post(read(accessToken))).status, 200);
  assert.equal((await post({ op: 'issue-access', code: 'VV-TEST' }, { ...headers, origin: 'https://evil.test' })).status, 403);
  state.allowed = false;
  assert.equal((await post({ op: 'auth', adminPw: process.env.DASH_PASSWORD })).status, 429);
  state.databaseAvailable = false;
  assert.equal((await post({ op: 'auth', adminPw: process.env.DASH_PASSWORD })).status, 502);
});
test('private photos are signed only within the authorized event folder', async () => {
  const { post, state } = setup();
  state.data.eventus_events[0].invitation_url = 'https://supabase.test/storage/v1/object/public/eventus-photos/VV-TEST/photo.jpg';
  state.data.eventus_events[0].invitation_brief = { carousel_photos: ['https://supabase.test/storage/v1/object/public/eventus-photos/VV-OTHER/private.jpg'] };
  const response = await post(read(token()));
  const [row] = await response.json();
  assert.match(row.invitation_url, /\/object\/sign\/eventus-photos\/VV-TEST\/photo.jpg\?token=/);
  assert.deepEqual(row.invitation_brief.carousel_photos, ['']);
  assert.ok(!state.calls.some(c => c.url.pathname.includes('VV-OTHER/private')));
  // The SELECT intentionally omits the event's code. Nested JSON must never
  // become an authority to sign files from another event's private folder.
  state.data.eventus_events[0].invitation_brief = { code: 'VV-OTHER', photos: ['https://supabase.test/storage/v1/object/public/eventus-photos/VV-OTHER/private.jpg'] };
  const selected = await post(read(token(), 'eventus_events', 'code=eq.VV-TEST&select=invitation_brief'));
  assert.deepEqual((await selected.json())[0].invitation_brief.photos, ['']);
  assert.ok(!state.calls.some(c => c.url.pathname.includes('VV-OTHER/private')));
});
test('HTML rendering escapes stored text, JS arguments and unsafe URL schemes', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../public/eventus.html'), 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  for (const script of scripts) new vm.Script(script);
  const source = scripts.join('\n');
  const helpers = source.slice(source.indexOf('function esc('), source.indexOf('function fmt$('));
  const sandbox = { location: { origin: 'https://web.test' }, URL };
  vm.runInNewContext(helpers, sandbox);
  const malicious = '\\"\'><img src=x onerror=alert(1)>'; // includes both attribute and JavaScript delimiters
  assert.equal(sandbox.esc(malicious).includes('<img'), false);
  const encodedArg = sandbox.jsArg(malicious);
  const decodedArg = encodedArg.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  assert.equal(vm.runInNewContext(decodedArg), malicious);
  assert.equal(sandbox.safeUrl('javascript:alert(1)'), '');
  assert.equal(sandbox.imageUrl('data:image/svg+xml,<svg onload=alert(1)>'), '');
  assert.ok(!source.includes("sessionStorage.setItem('eventus_adm'"));
  assert.ok(!source.includes('SB_KEY'));
  assert.ok(source.includes("admSendCode('+jsArg(ev.code)+')"));
  assert.ok(source.includes('+esc(brief.message)'));
  assert.ok(source.includes('+esc(item.text)'));
  assert.ok(source.includes("(first?', '+esc(first):'')"));
  assert.ok(source.includes("+esc(E.event_time||'18:00')"));
  const malformed = sandbox.normalizeBrief({ message: {}, photos: 'not-an-array' });
  assert.equal(malformed.message, undefined);
  assert.equal(malformed.photos.length, 0);
});
