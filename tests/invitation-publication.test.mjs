import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import test from 'node:test';
import { validateInvitations, validateProductionSource } from '../src/lib/invitation-publication.mjs';

const slug = 'mis-xv-test';
const privacy = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
];

async function fixture(t) {
  const temporaryRoot = resolve(tmpdir());
  const root = await mkdtemp(join(temporaryRoot, 'invitation-publication-test-'));
  assert.equal(dirname(resolve(root)), temporaryRoot);
  t.after(async () => {
    // Only the isolated directory created for this test can be recursively removed.
    assert.equal(dirname(resolve(root)), temporaryRoot);
    await rm(root, { recursive: true, force: true });
  });

  const manifest = {
    version: 1,
    excludedPublicDirectories: ['informes'],
    invitations: [{
      slug,
      files: ['index.html', 'assets/song.mp3', 'assets/style.css'],
      apiRoutes: ['/api/test-trivia'],
    }],
    redirects: [{ source: '/old', destination: `/${slug}` }],
  };
  const routes = {
    rewrites: [{ source: `/${slug}`, destination: `/${slug}/index.html` }],
    headers: [
      { source: `/${slug}`, headers: structuredClone(privacy) },
      { source: `/${slug}/:path*`, headers: structuredClone(privacy) },
    ],
    redirects: [{ source: '/old', destination: `/${slug}`, permanent: false }],
  };
  const config = {
    rewrites: async () => structuredClone(routes.rewrites),
    headers: async () => structuredClone(routes.headers),
    redirects: async () => structuredClone(routes.redirects),
  };

  function inside(relative) {
    const target = resolve(root, relative);
    assert.ok(target.startsWith(root + sep), 'fixture mutations stay inside the temporary root');
    return target;
  }
  async function write(relative, contents) {
    const target = inside(relative);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  async function remove(relative) {
    await rm(inside(relative), { recursive: true, force: true });
  }
  async function build({ objectRewrites = false } = {}) {
    await write('.next/routes-manifest.json', JSON.stringify({
      ...routes,
      rewrites: objectRewrites
        ? { beforeFiles: [], afterFiles: routes.rewrites, fallback: [] }
        : routes.rewrites,
    }));
    await write('.next/server/app-paths-manifest.json', JSON.stringify({
      '/api/test-trivia/route': 'app/api/test-trivia/route.js',
    }));
    await write('.next/server/app/api/test-trivia/route.js', 'exports.GET = () => new Response("synthetic");');
  }
  const validate = (options = {}) => validateInvitations({ root, config, manifest, ...options });

  await write(`public/${slug}/index.html`, '<!doctype html><html><head><title>Invitación de prueba</title><link rel="stylesheet" href="/mis-xv-test/assets/style.css"></head><body><audio src="/mis-xv-test/assets/song.mp3"></audio></body></html>');
  await write(`public/${slug}/assets/song.mp3`, 'synthetic audio fixture');
  await write(`public/${slug}/assets/style.css`, 'body { color: #333; }');
  await write('public/informes/index.html', '<!doctype html><title>Herramienta interna de prueba</title>');
  await write('src/app/api/test-trivia/route.ts', 'export async function GET() { return Response.json({ synthetic: true }); }');

  return { root, manifest, routes, config, write, remove, build, validate };
}

function blocked(result) {
  assert.ok(Array.isArray(result.errors), 'validation reports errors without contacting external services');
  assert.ok(result.errors.length > 0, 'an incomplete invitation must block publication');
}

test('a complete registered invitation passes source validation and excludes the internal informes page', async t => {
  const fixtureData = await fixture(t);
  const result = await fixtureData.validate();
  assert.deepEqual(result.errors, []);
  assert.equal(result.invitations, 1);
  assert.ok(result.files >= 3);
});

test('API source routes may use JavaScript instead of TypeScript', async t => {
  const f = await fixture(t);
  await f.remove('src/app/api/test-trivia/route.ts');
  await f.write('src/app/api/test-trivia/route.js', 'export async function GET() { return Response.json({ synthetic: true }); }');
  assert.deepEqual((await f.validate()).errors, []);
});

test('removing both an entire invitation and its route config still fails against the durable registry', async t => {
  const f = await fixture(t);
  await f.remove(`public/${slug}`);
  f.routes.rewrites = [];
  f.routes.headers = [];
  blocked(await f.validate());
});

test('every registered file is required even when the current HTML no longer references it', async t => {
  const f = await fixture(t);
  await f.write(`public/${slug}/index.html`, '<!doctype html><title>Invitación sin referencia a la canción</title>');
  await f.remove(`public/${slug}/assets/song.mp3`);
  blocked(await f.validate());
});

for (const file of ['index.html', 'assets/song.mp3', 'assets/style.css']) {
  test(`a missing registered ${file} blocks publication`, async t => {
    const f = await fixture(t);
    await f.remove(`public/${slug}/${file}`);
    blocked(await f.validate());
  });

  test(`an empty registered ${file} blocks publication`, async t => {
    const f = await fixture(t);
    await f.write(`public/${slug}/${file}`, '');
    blocked(await f.validate());
  });
}

test('a registered path cannot be a directory in place of a file', async t => {
  const f = await fixture(t);
  await f.remove(`public/${slug}/assets/song.mp3`);
  await mkdir(join(f.root, 'public', slug, 'assets', 'song.mp3'));
  blocked(await f.validate());
});

test('a missing required API source blocks publication without making API requests', async t => {
  const f = await fixture(t);
  await f.remove('src/app/api/test-trivia');
  blocked(await f.validate());
});

test('a missing clean invitation rewrite blocks publication', async t => {
  const f = await fixture(t);
  f.routes.rewrites = [];
  blocked(await f.validate());
});

test('a rewrite to a different page does not satisfy the invitation route', async t => {
  const f = await fixture(t);
  f.routes.rewrites[0].destination = '/informes/index.html';
  blocked(await f.validate());
});

for (const source of [`/${slug}`, `/${slug}/:path*`]) {
  test(`privacy headers must also protect ${source}`, async t => {
    const f = await fixture(t);
    f.routes.headers = f.routes.headers.filter(entry => entry.source !== source);
    blocked(await f.validate());
  });
}

for (const token of ['noindex', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex']) {
  test(`the invitation privacy header requires ${token}`, async t => {
    const f = await fixture(t);
    for (const rule of f.routes.headers) {
      rule.headers[0].value = privacy[0].value.split(', ').filter(value => value !== token).join(', ');
    }
    blocked(await f.validate());
  });
}

test('the invitation privacy header requires no-referrer', async t => {
  const f = await fixture(t);
  for (const rule of f.routes.headers) rule.headers[1].value = 'strict-origin-when-cross-origin';
  blocked(await f.validate());
});

test('a missing compatibility redirect blocks publication', async t => {
  const f = await fixture(t);
  f.routes.redirects = [];
  blocked(await f.validate());
});

test('a compatibility redirect cannot point at another invitation', async t => {
  const f = await fixture(t);
  f.routes.redirects[0].destination = '/mis-xv-other';
  blocked(await f.validate());
});

for (const source of ['/:path*', '/mis-xv-:name']) {
  test(`a redirect matching ${source} cannot eclipse an invitation`, async t => {
    const f = await fixture(t);
    f.routes.redirects.push({ source, destination: '/closed', permanent: false });
    blocked(await f.validate());
  });
}

test('a rewrite before the correct route cannot eclipse an invitation', async t => {
  const f = await fixture(t);
  f.routes.rewrites.unshift({ source: '/:path*', destination: '/closed.html' });
  blocked(await f.validate());
});

test('a beforeFiles catch-all cannot eclipse the invitation rewrite in afterFiles', async t => {
  const f = await fixture(t);
  f.routes.rewrites = {
    beforeFiles: [{ source: '/:path*', destination: '/closed.html' }],
    afterFiles: f.routes.rewrites,
    fallback: [],
  };
  blocked(await f.validate());
});

test('privacy is validated after a later wildcard header overrides the invitation rules', async t => {
  const f = await fixture(t);
  f.routes.headers.push({
    source: '/:path*',
    headers: [
      { key: 'X-Robots-Tag', value: 'index, follow' },
      { key: 'Referrer-Policy', value: 'unsafe-url' },
    ],
  });
  blocked(await f.validate());
});

test('a new public invitation must be registered before publishing', async t => {
  const f = await fixture(t);
  await f.write('public/mis-xv-new/index.html', '<!doctype html><title>Invitación nueva de prueba</title>');
  blocked(await f.validate());
});

test('a newly referenced local asset must exist even before it is added to the durable file list', async t => {
  const f = await fixture(t);
  await f.write(`public/${slug}/index.html`, '<!doctype html><title>Invitación de prueba</title><img src="assets/new-portrait.webp" alt="Retrato de prueba">');
  blocked(await f.validate());
});

test('resources referenced by a stylesheet are required relative to that stylesheet', async t => {
  const f = await fixture(t);
  await f.write(`public/${slug}/assets/style.css`, 'body { background-image: url("./new-background.webp"); }');
  blocked(await f.validate());
});

test('inline SVG fragments and external or embedded media do not require local files', async t => {
  const f = await fixture(t);
  await f.write(`public/${slug}/index.html`, '<!doctype html><title>Invitación de prueba</title><svg><path fill="url(#petal)"></path></svg><img src="https://external.invalid/photo.webp" alt="Externa"><img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" alt="Interna">');
  assert.deepEqual((await f.validate()).errors, []);
});

const invalidManifests = [
  ['an unsupported registry version', manifest => { manifest.version = 2; }],
  ['a missing invitation list', manifest => { delete manifest.invitations; }],
  ['an invalid invitation entry', manifest => { manifest.invitations.push(null); }],
  ['a duplicate invitation slug', manifest => { manifest.invitations.push(structuredClone(manifest.invitations[0])); }],
  ['a slug containing traversal', manifest => { manifest.invitations[0].slug = '../outside'; }],
  ['an absolute invitation file', manifest => { manifest.invitations[0].files.push('/outside.mp3'); }],
  ['an existing absolute file outside its invitation', async (manifest, f) => {
    await f.write('outside.mp3', 'synthetic file outside the invitation directory');
    manifest.invitations[0].files.push(join(f.root, 'outside.mp3').split(sep).join('/'));
  }],
  ['an invitation file containing traversal', manifest => { manifest.invitations[0].files.push('../outside.mp3'); }],
  ['a Windows traversal path', manifest => { manifest.invitations[0].files.push('..\\outside.mp3'); }],
  ['an invitation without an index entry', manifest => { manifest.invitations[0].files = ['assets/song.mp3']; }],
  ['a duplicate registered file', manifest => { manifest.invitations[0].files.push('assets/song.mp3'); }],
];

for (const [description, mutate] of invalidManifests) {
  test(`${description} is rejected with a validation error`, async t => {
    const f = await fixture(t);
    await mutate(f.manifest, f);
    blocked(await f.validate());
  });
}

for (const objectRewrites of [false, true]) {
  test(`a complete built artifact passes with ${objectRewrites ? 'grouped' : 'array'} rewrites`, async t => {
    const f = await fixture(t);
    await f.build({ objectRewrites });
    assert.deepEqual((await f.validate({ built: true })).errors, []);
  });
}

test('built validation fails when the Next routes manifest is absent', async t => {
  const f = await fixture(t);
  await f.build();
  await f.remove('.next/routes-manifest.json');
  blocked(await f.validate({ built: true }));
});

test('built validation fails when routes are omitted from the compiled artifact', async t => {
  const f = await fixture(t);
  await f.build();
  const routes = JSON.parse(await readFile(join(f.root, '.next/routes-manifest.json'), 'utf8'));
  routes.rewrites = [];
  await f.write('.next/routes-manifest.json', JSON.stringify(routes));
  blocked(await f.validate({ built: true }));
});

test('built validation checks compiled privacy headers in addition to source config', async t => {
  const f = await fixture(t);
  await f.build();
  const routes = JSON.parse(await readFile(join(f.root, '.next/routes-manifest.json'), 'utf8'));
  routes.headers = [];
  await f.write('.next/routes-manifest.json', JSON.stringify(routes));
  blocked(await f.validate({ built: true }));
});

test('built validation checks compiled compatibility redirects', async t => {
  const f = await fixture(t);
  await f.build();
  const routes = JSON.parse(await readFile(join(f.root, '.next/routes-manifest.json'), 'utf8'));
  routes.redirects = [];
  await f.write('.next/routes-manifest.json', JSON.stringify(routes));
  blocked(await f.validate({ built: true }));
});

test('built validation fails when an API is missing from the app paths manifest', async t => {
  const f = await fixture(t);
  await f.build();
  await f.write('.next/server/app-paths-manifest.json', '{}');
  blocked(await f.validate({ built: true }));
});

test('built validation fails when the API paths manifest is absent', async t => {
  const f = await fixture(t);
  await f.build();
  await f.remove('.next/server/app-paths-manifest.json');
  blocked(await f.validate({ built: true }));
});

for (const empty of [false, true]) {
  test(`built validation rejects a ${empty ? 'zero-byte' : 'missing'} emitted API route`, async t => {
    const f = await fixture(t);
    await f.build();
    if (empty) await f.write('.next/server/app/api/test-trivia/route.js', '');
    else await f.remove('.next/server/app/api/test-trivia/route.js');
    blocked(await f.validate({ built: true }));
  });
}

test('malformed build metadata blocks publication with a useful validation result', async t => {
  const f = await fixture(t);
  await f.build();
  await f.write('.next/routes-manifest.json', '{ invalid JSON');
  blocked(await f.validate({ built: true }));
});

const productionRevision = 'a'.repeat(40);
const productionSource = { repository: 'https://github.com/org/repo.git', branch: 'main' };
const productionEnvironment = {
  VERCEL: '1',
  VERCEL_ENV: 'production',
  VERCEL_GIT_COMMIT_SHA: productionRevision,
};

test('production publication accepts the current main revision after verifying the configured repository', async () => {
  let queries = 0;
  const errors = await validateProductionSource({
    env: productionEnvironment,
    source: productionSource,
    getMainRevision: async source => {
      queries++;
      assert.deepEqual(source, productionSource);
      return productionRevision;
    },
  });
  assert.deepEqual(errors, []);
  assert.equal(queries, 1);
});

test('production publication blocks missing Git metadata before querying the repository', async () => {
  let queries = 0;
  const errors = await validateProductionSource({
    env: { ...productionEnvironment, VERCEL_GIT_COMMIT_SHA: undefined },
    source: productionSource,
    getMainRevision: async () => { queries++; return productionRevision; },
  });
  assert.ok(errors.length > 0);
  assert.equal(queries, 0);
});

test('production publication blocks an older revision even if its own invitation registry passes', async () => {
  const errors = await validateProductionSource({
    env: productionEnvironment,
    source: productionSource,
    getMainRevision: async () => 'b'.repeat(40),
  });
  assert.ok(errors.length > 0);
});

test('production publication blocks when the current main revision cannot be consulted', async () => {
  const errors = await validateProductionSource({
    env: productionEnvironment,
    source: productionSource,
    getMainRevision: async () => { throw new Error('Synthetic repository lookup failure'); },
  });
  assert.ok(errors.length > 0);
});

test('production publication blocks an invalid response from the repository lookup', async () => {
  const errors = await validateProductionSource({
    env: productionEnvironment,
    source: productionSource,
    getMainRevision: async () => 'truncated-revision',
  });
  assert.ok(errors.length > 0);
});

for (const [environment, env] of [
  ['preview', { VERCEL: '1', VERCEL_ENV: 'preview' }],
  ['local', {}],
]) {
  test(`${environment} validation does not require or query production Git metadata`, async () => {
    let queries = 0;
    const errors = await validateProductionSource({
      env,
      source: undefined,
      getMainRevision: async () => { queries++; throw new Error('This lookup must never run'); },
    });
    assert.deepEqual(errors, []);
    assert.equal(queries, 0);
  });
}
