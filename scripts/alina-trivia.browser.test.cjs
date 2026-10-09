/* App acceptance against the local Next server. All API requests are synthetic;
 * this suite cannot create a participant in a real database.
 * NODE_PATH=<Playwright runtime> ALINA_BASE_URL=http://127.0.0.1:3038 node --test scripts/alina-trivia.browser.test.cjs
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = new URL(process.env.ALINA_BASE_URL || 'http://127.0.0.1:3038');
const invitationURL = new URL('/mis-xv-alina-fernanda', base).href;
const version = 'alina-8-v1';
const answers = { '1': 'rosa', '2': 'chilaquiles', '3': 'uvas', '4': 'charles-ans', '5': 'visita', '7': 'videos', '8': 'cerditos', '9': 'suiza' };
const questionOptions = [
  ['1', '¿Cuál es el color favorito de Alina?', [['azul', 'Azul'], ['rosa', 'Rosa'], ['verde', 'Verde'], ['lila', 'Lila']]],
  ['2', '¿Cuál es su comida favorita?', [['pizza', 'Pizza'], ['sushi', 'Sushi'], ['chilaquiles', 'Chilaquiles'], ['tacos', 'Tacos']]],
  ['3', '¿Cuál es su postre favorito?', [['uvas', 'Uvas'], ['helado', 'Helado'], ['pastel', 'Pastel de chocolate'], ['fresas', 'Fresas']]],
  ['4', '¿Quién es su cantante o grupo favorito?', [['billie-eilish', 'Billie Eilish'], ['bad-bunny', 'Bad Bunny'], ['taylor-swift', 'Taylor Swift'], ['charles-ans', 'Charles Ans']]],
  ['5', '¿Cuál es su canción favorita?', [['enchanted', 'Enchanted (Taylor Swift)'], ['visita', 'Visita (Enjambre)'], ['perfect', 'Perfect (Ed Sheeran)'], ['rosa-pastel', 'Rosa pastel (Belanova)']]],
  ['7', '¿Qué le gusta hacer en su tiempo libre?', [['leer', 'Leer'], ['bailar', 'Bailar'], ['videos', 'Ver videos'], ['dibujar', 'Dibujar']]],
  ['8', '¿Cuál es su animal favorito?', [['cerditos', 'Cerditos'], ['gatitos', 'Gatitos'], ['perritos', 'Perritos'], ['conejos', 'Conejos']]],
  ['9', '¿Qué país le gustaría conocer?', [['japon', 'Japón'], ['italia', 'Italia'], ['canada', 'Canadá'], ['suiza', 'Suiza']]],
];
const questions = questionOptions.map(([id, text, options]) => ({ id, text, options: options.map(([id, text]) => ({ id, text })) }));
let browser;
before(async () => { browser = await chromium.launch({ headless: true, channel: 'chrome' }); });
after(async () => { await browser?.close(); });

async function fixture(t, { width = 390, failPostOnce = false, failGetOnce = false, serverCorrectCount = 8 } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width <= 390, hasTouch: width <= 390, reducedMotion: 'reduce', serviceWorkers: 'block' });
  t.after(() => context.close());
  const state = { gets: 0, posts: [], saved: new Map(), failedPost: false, failedGet: false };
  const currentBoard = () => ({
    leaderboard: [
      { name: 'Amiga de prueba', score: 800, rank: 1 },
      ...Array.from(state.saved.values()).map(row => ({ name: row.name, score: row.score, rank: row.rank })),
      { name: 'Invitado de prueba', score: 700, rank: serverCorrectCount === 8 && state.saved.size ? 3 : 2 },
    ], totalPlayers: 2 + state.saved.size,
  });
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base.origin) return route.abort('blockedbyclient');
    if (url.pathname === '/api/alina-trivia') {
      if (request.method() === 'GET') {
        state.gets++;
        if (failGetOnce && !state.failedGet) {
          state.failedGet = true;
          return route.fulfill({ status: 503, json: { error: 'Synthetic unavailable board' } });
        }
        return route.fulfill({ status: 200, json: { version, questions, pointsPerCorrect: 100, ...currentBoard() } });
      }
      assert.equal(request.method(), 'POST');
      const payload = request.postDataJSON();
      state.posts.push(payload);
      assert.equal(payload.version, version);
      assert.match(payload.attemptId, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
      assert.deepEqual(payload.answers.map(answer => answer.questionId), ['1', '2', '3', '4', '5', '7', '8', '9']);
      if (!state.saved.has(payload.attemptId)) state.saved.set(payload.attemptId, {
        name: payload.name, score: serverCorrectCount * 100, correctCount: serverCorrectCount, totalQuestions: 8, rank: serverCorrectCount === 8 ? 1 : 3,
      });
      if (failPostOnce && !state.failedPost) {
        // The server saved it, but the response failed. A retry must reuse the ID.
        state.failedPost = true;
        return route.fulfill({ status: 503, json: { error: 'Synthetic interrupted response' } });
      }
      return route.fulfill({ status: 200, json: { version, result: state.saved.get(payload.attemptId), ...currentBoard() } });
    }
    if (/^\/api(?:\/|$)/.test(url.pathname)) return route.abort('blockedbyclient');
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(invitationURL, { waitUntil: 'networkidle' });
  assert.equal(state.gets, 0, 'the trivia must not fetch during the envelope or main invitation load');
  async function reveal() {
    await page.locator('#open-invitation').click();
    await page.locator('#envelope-gate').waitFor({ state: 'hidden' });
    await page.locator('#trivia').scrollIntoViewIfNeeded();
  }
  async function ready() {
    await reveal();
    await page.waitForFunction(() => !document.getElementById('trivia-start').disabled);
  }
  async function start(name = 'Invitada de prueba') {
    await page.locator('#trivia-name').fill(name);
    await page.locator('#trivia-start').click();
    await page.locator('#trivia-question-form').waitFor({ state: 'visible' });
  }
  async function finish({ keyboard = false } = {}) {
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      assert.equal(await page.locator('#trivia-progress-label').textContent(), `Pregunta ${index + 1} de 8`);
      assert.equal(await page.locator('#trivia-options input').count(), 4);
      assert.equal(await page.locator('#trivia-next').isDisabled(), true, 'must choose an answer before moving on');
      const option = page.locator(`#trivia-options input[value="${answers[question.id]}"]`);
      if (keyboard) {
        await option.focus();
        await option.press('Space');
        await page.locator('#trivia-next').focus();
        await page.locator('#trivia-next').press('Enter');
      } else {
        await option.check();
        await page.locator('#trivia-next').click();
      }
    }
  }
  return { page, state, errors, reveal, ready, start, finish };
}

test('eight questions work with the keyboard; the server supplies score and shared tied places', async t => {
  const { page, state, errors, ready, start, finish } = await fixture(t);
  await ready();
  await start();
  const first = page.locator('#trivia-options input').first();
  await first.focus();
  await first.press('ArrowRight');
  assert.equal(await page.locator('#trivia-options input:checked').inputValue(), 'rosa', 'native radio arrow keys work');
  // Return the first question to its unanswered state, then exercise the whole sequence.
  await page.locator('#trivia-options input:checked').evaluate(input => { input.checked = false; input.dispatchEvent(new Event('change', { bubbles: true })); });
  await finish({ keyboard: true });
  await page.locator('#trivia-result').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#trivia-result-score').textContent(), '800');
  assert.equal(await page.locator('#trivia-result-detail').textContent(), '8 de 8 respuestas correctas');
  assert.equal(await page.locator('#trivia-result-rank').textContent(), 'Tu lugar al terminar: 1º');
  assert.deepEqual(await page.locator('#trivia-board-rows tr td:first-child').allTextContents(), ['1.', '1.', '3.']);
  assert.equal(await page.locator('#trivia-start-form').isHidden(), true);
  assert.equal(await page.locator('#trivia-question-form').isHidden(), true);
  assert.equal(state.posts.length, 1);
  assert.equal(state.saved.size, 1);
  assert.deepEqual(errors, []);
});

test('mobile layouts fit at 390 and 320px; a failed save and reload reuse the exact attempt', async t => {
  for (const width of [390, 320]) {
    const { page, state, errors, ready, reveal, start, finish } = await fixture(t, { width, failPostOnce: true, serverCorrectCount: 5 });
    await ready();
    await page.locator('#trivia-name').fill('<script>');
    await page.locator('#trivia-start').click();
    assert.equal(await page.locator('#trivia-name').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#trivia-question-form').isHidden(), true);
    await start('Nombre de prueba muy largo 123456');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `question must fit ${width}px`);
    await finish();
    await page.locator('#trivia-retry').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#trivia-result').isHidden(), true, 'cannot invent a score before server confirmation');
    assert.match(await page.locator('#trivia-status').textContent(), /todavía no se ha guardado/);
    await page.locator('#trivia-retry').click();
    await page.locator('#trivia-result').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#trivia-result-score').textContent(), '500', 'the browser must use the server score rather than grading locally');
    assert.equal(await page.locator('#trivia-result-detail').textContent(), '5 de 8 respuestas correctas');
    assert.deepEqual(state.posts[0], state.posts[1]);
    assert.equal(state.saved.size, 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `result and ranking must fit ${width}px`);
    await page.reload({ waitUntil: 'networkidle' });
    await reveal();
    await page.locator('#trivia-result').waitFor({ state: 'visible' });
    assert.equal(state.posts.length, 3);
    assert.deepEqual(state.posts[0], state.posts[2]);
    assert.equal(state.saved.size, 1, 'reload cannot insert another participant');
    const beforeRefresh = state.gets;
    await page.locator('#trivia-refresh').click();
    await page.waitForFunction(() => !document.getElementById('trivia-refresh').disabled);
    assert.equal(state.gets, beforeRefresh + 1);
    assert.equal(state.posts.length, 3, 'refreshing the board does not resubmit a result');
    assert.deepEqual(errors, []);
  }
});

test('an unavailable shared board offers a working retry instead of a local substitute', async t => {
  const { page, state, errors, reveal } = await fixture(t, { failGetOnce: true });
  await reveal();
  await page.locator('#trivia-retry').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#trivia-start').isDisabled(), true);
  assert.equal(await page.locator('#trivia-board-table-wrap').isHidden(), true);
  await page.locator('#trivia-retry').click();
  await page.waitForFunction(() => !document.getElementById('trivia-start').disabled);
  assert.equal(state.gets, 2);
  assert.equal(state.posts.length, 0);
  assert.equal(await page.locator('#trivia-board-table-wrap').isVisible(), true);
  assert.deepEqual(errors, []);
});
