/*
 * Acceptance against the real Next server; external and real API traffic is blocked.
 * The trivia's read-only GET uses a synthetic board; all API writes remain blocked.
 * Start the server separately, then run:
 * NODE_PATH=../bot-villaverde/node_modules node --test scripts/alina-invitation.browser.test.cjs
 * Optional: ALINA_BASE_URL (default http://127.0.0.1:3028), ALINA_SCREENSHOT_DIR.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const base = new URL(process.env.ALINA_BASE_URL || 'http://127.0.0.1:3028');
const slug = '/mis-xv-alina-fernanda';
const invitationURL = new URL(slug, base).href;
const triviaQuestions = [
  ['1', '¿Cuál es el color favorito de Alina?', [['azul', 'Azul'], ['rosa', 'Rosa'], ['verde', 'Verde'], ['lila', 'Lila']]],
  ['2', '¿Cuál es su comida favorita?', [['pizza', 'Pizza'], ['sushi', 'Sushi'], ['chilaquiles', 'Chilaquiles'], ['tacos', 'Tacos']]],
  ['3', '¿Cuál es su postre favorito?', [['uvas', 'Uvas'], ['helado', 'Helado'], ['pastel', 'Pastel de chocolate'], ['fresas', 'Fresas']]],
  ['4', '¿Quién es su cantante o grupo favorito?', [['billie-eilish', 'Billie Eilish'], ['bad-bunny', 'Bad Bunny'], ['taylor-swift', 'Taylor Swift'], ['charles-ans', 'Charles Ans']]],
  ['5', '¿Cuál es su canción favorita?', [['enchanted', 'Enchanted (Taylor Swift)'], ['visita', 'Visita (Enjambre)'], ['perfect', 'Perfect (Ed Sheeran)'], ['rosa-pastel', 'Rosa pastel (Belanova)']]],
  ['7', '¿Qué le gusta hacer en su tiempo libre?', [['leer', 'Leer'], ['bailar', 'Bailar'], ['videos', 'Ver videos'], ['dibujar', 'Dibujar']]],
  ['8', '¿Cuál es su animal favorito?', [['cerditos', 'Cerditos'], ['gatitos', 'Gatitos'], ['perritos', 'Perritos'], ['conejos', 'Conejos']]],
  ['9', '¿Qué país le gustaría conocer?', [['japon', 'Japón'], ['italia', 'Italia'], ['canada', 'Canadá'], ['suiza', 'Suiza']]],
].map(([id, text, options]) => ({ id, text, options: options.map(([id, text]) => ({ id, text })) }));
let browser;

before(async () => {
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
});
after(async () => { await browser?.close(); });

async function fixture(t, {
  width = 390, height = 900, config, reducedMotion = 'reduce', fixedTime, audio,
  javaScriptEnabled = true, saveData = false, videoFailure = false,
  rejectVideoPlay = false, stallVideoPlay = false, recordMedia = false,
} = {}) {
  const context = await browser.newContext({
    viewport: { width, height }, reducedMotion,
    isMobile: width <= 390, hasTouch: width <= 390,
    javaScriptEnabled,
    // The event must keep its Mexico City time even on a guest's different timezone.
    timezoneId: 'America/Los_Angeles', serviceWorkers: 'block',
  });
  t.after(() => context.close());
  const blocked = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === base.origin && url.pathname === '/api/alina-trivia' && route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: {
        version: 'alina-8-v1', questions: triviaQuestions, pointsPerCorrect: 100,
        leaderboard: [], totalPlayers: 0,
      } });
      return;
    }
    if (url.origin !== base.origin || /^\/api(?:\/|$)/.test(url.pathname)) {
      blocked.push(url.href);
      await route.abort('blockedbyclient');
    } else {
      await route.continue();
    }
  });
  if (config) {
    await context.route('**/mis-xv-alina-fernanda/assets/config.js', async route => {
      const original = await route.fetch();
      assert.equal(original.status(), 200, 'the actual event configuration must load');
      await route.fulfill({
        response: original,
        body: `${await original.text()}\nwindow.ALINA_EVENT = Object.freeze({...window.ALINA_EVENT, ...${JSON.stringify(config)}});`,
      });
    });
  }
  if (audio) {
    await context.route('**/mis-xv-alina-fernanda/assets/acceptance-tone.wav', route => route.fulfill({
      status: 200, contentType: 'audio/wav', body: audio,
    }));
  }
  if (videoFailure) {
    await context.route('**/mis-xv-alina-fernanda/assets/apertura-sobre.mp4', route => route.fulfill({
      status: 503, contentType: 'video/mp4', body: 'Synthetic unavailable intro',
    }));
  }
  await context.addInitScript(({ saveData, rejectVideoPlay, stallVideoPlay, recordMedia }) => {
    window.__acceptanceOpened = [];
    // Never navigate to or send a message through WhatsApp, even in the happy path.
    window.open = (...args) => { window.__acceptanceOpened.push(args); return null; };
    if (saveData) Object.defineProperty(navigator, 'connection', {
      configurable: true, value: { saveData: true, effectiveType: '4g' },
    });
    if (recordMedia || rejectVideoPlay || stallVideoPlay) {
      window.__acceptanceMedia = [];
      const nativePlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (...args) {
        window.__acceptanceMedia.push({
          id: this.id, kind: this.tagName, userActive: navigator.userActivation.isActive,
          muted: this.muted, volume: this.volume, at: performance.now(),
        });
        if (rejectVideoPlay && this instanceof HTMLVideoElement) {
          return Promise.reject(new DOMException('Synthetic playback rejection', 'NotAllowedError'));
        }
        if (stallVideoPlay && this instanceof HTMLVideoElement) return new Promise(() => {});
        return nativePlay.apply(this, args);
      };
      document.addEventListener('ended', event => {
        if (event.target instanceof HTMLVideoElement) window.__acceptanceVideoEnded = performance.now();
      }, true);
    }
  }, { saveData, rejectVideoPlay, stallVideoPlay, recordMedia });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  const videoRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/apertura-sobre.mp4')) videoRequests.push(request.url());
  });
  if (fixedTime) await page.clock.setFixedTime(new Date(fixedTime));
  async function load(search = '') {
    const response = await page.goto(invitationURL + search, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, 'clean invitation URL must resolve');
    await page.locator('#open-invitation').waitFor({ state: 'visible' });
    assert.deepEqual(errors, [], 'no browser JavaScript errors');
    return response;
  }
  async function open(method = 'click') {
    if (method === 'keyboard') await page.locator('#open-invitation').press('Enter');
    else await page.locator('#open-invitation').click();
    await page.locator('#envelope-gate').waitFor({ state: 'hidden', timeout: 15000 });
    assert.equal(await page.locator('#invitation-content').evaluate(node => node.inert), false);
  }
  return { context, page, blocked, errors, videoRequests, load, open };
}

test('clean URL, private headers, complete assets, and accessible envelope on desktop and mobile', async t => {
  for (const width of [1440, 390, 320]) {
    const { page, blocked, errors, load, open } = await fixture(t, { width, reducedMotion: 'no-preference' });
    const failures = [];
    page.on('response', response => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });
    const response = await load();
    assert.match(response.headers()['x-robots-tag'] || '', /noindex/i);
    assert.equal(response.headers()['referrer-policy'], 'no-referrer');
    assert.equal(new URL(page.url()).pathname, slug);
    assert.equal(await page.locator('#invitation-content').evaluate(node => node.inert), true);
    assert.equal(await page.locator('#open-invitation').evaluate(node => document.activeElement === node), true);
    if (process.env.ALINA_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.ALINA_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, `gate-${width}.png`) });
    }
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#open-invitation').evaluate(node => document.activeElement === node), true,
      'keyboard focus stays on the envelope until it is opened');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
      `closed envelope fits ${width}px`);
    await open(width === 1440 ? 'keyboard' : 'click');
    assert.equal(await page.locator('#name').evaluate(node => document.activeElement === node), true,
      'opening moves keyboard focus into the invitation');
    assert.match(await page.locator('#name').innerText(), /Alina\s+Fernanda/);
    await page.waitForFunction(() => [...document.querySelectorAll('.hero-copy *')]
      .flatMap(node => node.getAnimations()).filter(animation => animation.effect.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== 'running'));
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; });
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.complete ? undefined : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      })));
      window.__acceptanceDocument = 'opened';
    });
    if (process.env.ALINA_SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, `hero-${width}.png`) });
    }
    assert.deepEqual(await page.evaluate(() => [...document.images].filter(image => !image.naturalWidth).map(image => image.src)), []);
    const hashes = await page.locator('a[href^="#"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')))]);
    assert.ok(hashes.length > 0, 'invitation offers in-page navigation');
    for (const hash of hashes) {
      const link = page.locator(`a[href="${hash}"]`).first();
      // Skip links intentionally live offscreen until focused; activate them by keyboard.
      if (await link.evaluate(node => node.classList.contains('skip-link'))) {
        await link.press('Enter');
        assert.equal(await page.locator('#name').evaluate(node => document.activeElement === node), true,
          'skip navigation transfers keyboard focus and stops covering mobile links');
      } else await link.click();
      assert.equal(new URL(page.url()).hash, hash);
      assert.equal(await page.locator('#envelope-gate').isVisible(), false, 'anchor navigation never reopens the envelope');
      assert.equal(await page.evaluate(() => window.__acceptanceDocument), 'opened', 'anchors do not reload the document');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
      `open invitation fits ${width}px without horizontal scroll`);
    assert.equal(await page.locator('[data-nextjs-dialog], .vite-error-overlay').count(), 0);
    const content = await page.locator('#invitation-content').innerText();
    for (const name of ['Joana Sánchez', 'Madelin Sánchez', 'David Rendón', 'San José Obrero', 'Salón Villaverde']) {
      assert.ok(content.includes(name), `confirmed event detail: ${name}`);
    }
    assert.match(content, /elegante sport/i);
    assert.match(content, /azul cielo/i);
    assert.doesNotMatch(content, /Dayana|Garduño|Zulema|Montserrat/i, 'no copied family details');
    assert.deepEqual(failures, [], 'all loaded local assets return successfully');
    assert.deepEqual(blocked, [], 'this self-contained invitation requests no external service');
    assert.deepEqual(errors, []);
    if (process.env.ALINA_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.ALINA_SCREENSHOT_DIR, { recursive: true });
      // Use the guest-facing pause control to reveal the complete composition.
      await page.locator('#motion-toggle').click();
      await page.waitForFunction(() => [...document.querySelectorAll('.text-motion')]
        .every(node => getComputedStyle(node).opacity === '1'));
      await page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, `invitation-${width}.png`), fullPage: true });
    }
    await page.close();
  }
  const compact = await fixture(t, { width: 354, height: 574, reducedMotion: 'no-preference' });
  await compact.load();
  for (const selector of ['#gate-name', '#open-invitation', '#gate-hint', '.gate-date']) {
    const box = await compact.page.locator(selector).boundingBox();
    assert.ok(box && box.y >= 0 && box.y + box.height <= 574, `${selector} fits a short 354x574 mobile screen`);
  }
  assert.equal(await compact.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  if (process.env.ALINA_SCREENSHOT_DIR) {
    await compact.page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, 'gate-354x574.png') });
  }
  await compact.open();
  assert.equal(await compact.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});

test('countdown and calendars preserve the confirmed Mexico City ceremony and reception times', async t => {
  const { page, load, open } = await fixture(t, { fixedTime: '2026-11-27T20:43:58Z' });
  await load();
  await open();
  const countdown = () => page.locator('[data-countdown]').evaluateAll(nodes => Object.fromEntries(
    nodes.map(node => [node.dataset.countdown, node.textContent]),
  ));
  assert.deepEqual(await countdown(), { days: '01', hours: '01', minutes: '01', seconds: '02' });
  const google = new URL(await page.locator('#calendar-google').getAttribute('href'));
  assert.equal(google.origin, 'https://calendar.google.com');
  assert.equal(google.searchParams.get('dates'), '20261128/20261129');
  assert.equal(google.searchParams.get('ctz'), 'America/Mexico_City');
  assert.match(google.searchParams.get('text'), /Alina Fernanda/);
  assert.match(google.searchParams.get('details'), /3:45 p\. m\./);
  assert.match(google.searchParams.get('details'), /6:00 p\. m\./);

  const icsLink = page.locator('a[href$=".ics"]');
  assert.equal(await icsLink.count(), 1, 'Apple/Outlook calendar download is available');
  const icsURL = await icsLink.evaluate(node => node.href);
  assert.equal(new URL(icsURL).origin, base.origin);
  const response = await fetch(icsURL);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  assert.ok(text.endsWith('\r\n'), 'ICS ends with CRLF');
  assert.doesNotMatch(text, /(?<!\r)\n|\r(?!\n)/, 'ICS uses CRLF only');
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75, 'ICS folds lines at 75 UTF-8 octets');
  const unfolded = text.replace(/\r\n[ \t]/g, '');
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.match(unfolded, /DTSTART:20261128T214500Z\r\n/);
  assert.match(unfolded, /DTSTART:20261129T000000Z\r\n/);
  assert.match(unfolded, /Salón Villaverde/);
  assert.match(unfolded, /Jiménez Cantú/);
  assert.doesNotMatch(unfolded, /DTEND:|DURATION:/, 'no unconfirmed end time is invented');

  await page.clock.setFixedTime(new Date('2026-11-28T21:45:00Z'));
  await page.waitForFunction(() => [...document.querySelectorAll('[data-countdown]')].every(node => node.textContent === '00'));
  assert.deepEqual(await countdown(), { days: '00', hours: '00', minutes: '00', seconds: '00' });
  await page.clock.setFixedTime(new Date('2026-12-01T12:00:00Z'));
  assert.match(await page.locator('#countdown-message').innerText(), /celebración ha comenzado/i);
  await page.waitForTimeout(1100);
  assert.deepEqual(await countdown(), { days: '00', hours: '00', minutes: '00', seconds: '00' }, 'expired countdown never becomes negative');
});

test('personalized invitations safely handle guest names and pass limits while missing music and RSVP stay honest', async t => {
  const { page, blocked, load, open } = await fixture(t, { config: { music: { src: null, title: null } } });
  const name = '<img src=x onerror="window.__ALINA_XSS__=true">';
  await load(`?${new URLSearchParams({ para: name, pases: '2', music: 'https://example.test/song.mp3', phone: '525500000000' })}`);
  await open();
  assert.equal(await page.locator('#guest-name').innerText(), `Para ${name}`);
  assert.equal(await page.locator('#guest-name img').count(), 0);
  assert.equal(await page.evaluate(() => window.__ALINA_XSS__), undefined);
  assert.equal(await page.locator('#rsvp-name').inputValue(), name);
  assert.equal(await page.locator('#rsvp-guests').getAttribute('max'), '2');
  assert.equal(await page.locator('#rsvp-guests').inputValue(), '2');
  assert.equal(await page.locator('#rsvp-submit').isDisabled(), true);
  assert.equal(await page.locator('#music-toggle').isDisabled(), true);
  assert.equal(await page.locator('#invitation-audio').getAttribute('src'), null);
  assert.match(await page.locator('#music-status').innerText(), /pronto/i);
  assert.match(await page.locator('#rsvp-status').innerText(), /pronto|pendiente|habilitar|compartir/i);
  await page.locator('#rsvp-form').evaluate(form => form.requestSubmit());
  assert.deepEqual(await page.evaluate(() => window.__acceptanceOpened), []);

  for (const passes of ['1', '20', '0', '-1', '21', '01', '1.5', '2e1']) {
    await load(`?${new URLSearchParams({ para: 'Familia de prueba', pases: passes })}`);
    const valid = passes === '1' || passes === '20';
    assert.equal(await page.locator('#guest-passes').evaluate(node => !node.hidden), valid, `passes=${passes}`);
    assert.equal(await page.locator('#rsvp-guests').getAttribute('max'), valid ? passes : '20');
  }
  await load('?p=Familia%20Alias&n=3');
  assert.equal(await page.locator('#rsvp-name').inputValue(), 'Familia Alias');
  assert.equal(await page.locator('#rsvp-guests').getAttribute('max'), '3');
  assert.deepEqual(blocked, [], 'query parameters cannot inject remote resources');
});

test('configured RSVP validates attendance and passes and only prepares a synthetic WhatsApp message', async t => {
  const { page, blocked, load, open } = await fixture(t, { config: { rsvpPhone: '525500000000' } });
  await load('?para=Familia%20de%20prueba&pases=3');
  await open();
  const opened = () => page.evaluate(() => window.__acceptanceOpened);
  const submit = page.locator('#rsvp-submit');
  assert.equal(await submit.isDisabled(), false);
  await page.locator('input[name="attendance"][value="yes"]').check();
  await page.locator('#rsvp-name').fill('   ');
  await submit.click();
  assert.equal((await opened()).length, 0, 'blank family name does not prepare a message');
  await page.locator('#rsvp-name').fill('Familia de prueba');
  for (const count of ['0', '4', '1.5']) {
    await page.locator('#rsvp-guests').fill(count);
    await submit.click();
    assert.equal((await opened()).length, 0, `invalid count ${count} cannot confirm`);
  }
  await page.locator('#rsvp-guests').fill('3');
  await page.locator('#rsvp-message').fill('¡Gracias! Nos vemos allá.');
  await submit.click();
  let calls = await opened();
  assert.equal(calls.length, 1);
  const yes = new URL(calls[0][0]);
  assert.equal(yes.origin, 'https://wa.me');
  assert.equal(yes.pathname, '/525500000000');
  assert.match(yes.searchParams.get('text'), /Confirmo mi asistencia.*Alina Fernanda.*28 de noviembre de 2026/s);
  assert.match(yes.searchParams.get('text'), /Asistimos 3 personas/);
  assert.match(yes.searchParams.get('text'), /¡Gracias! Nos vemos allá\./);
  assert.deepEqual(calls[0].slice(1), ['_blank', 'noopener,noreferrer']);
  assert.match(await page.locator('#rsvp-status').innerText(), /Envía el mensaje en WhatsApp para completar/i,
    'a prepared message is never described as a saved confirmation');
  assert.equal(await page.locator('#rsvp-status a').getAttribute('href'), calls[0][0], 'blocked-popup fallback retains the prepared message');

  await page.locator('input[name="attendance"][value="no"]').check();
  assert.equal(await page.locator('#rsvp-guests-field').isVisible(), false);
  assert.equal(await page.locator('#rsvp-guests').isDisabled(), true);
  await page.locator('#rsvp-message').fill('');
  await submit.click();
  calls = await opened();
  assert.equal(calls.length, 2);
  const no = new URL(calls[1][0]).searchParams.get('text');
  assert.match(no, /Lamento no poder acompañarlos.*Alina Fernanda/s);
  assert.doesNotMatch(no, /Asistimos|personas/);
  assert.equal(page.url(), `${invitationURL}?para=Familia%20de%20prueba&pases=3`);
  assert.deepEqual(blocked, [], 'no WhatsApp or backend request is actually issued');
});

function silentWav() {
  const samples = 8000 * 8;
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(8000, 24); bytes.writeUInt32LE(16000, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(samples * 2, 40);
  return bytes;
}

test('a configured local song plays from the opening gesture, pauses, resumes, and reports loading errors', async t => {
  const config = { music: { src: 'assets/acceptance-tone.wav', title: 'Audio sintético de prueba' } };
  const good = await fixture(t, { config, audio: silentWav() });
  await good.load();
  assert.equal(await good.page.locator('#invitation-audio').evaluate(audio => audio.paused), true, 'no autoplay before the guest opens the invitation');
  await good.open();
  await good.page.waitForFunction(() => !document.getElementById('invitation-audio').paused);
  assert.equal(await good.page.locator('#music-toggle').getAttribute('aria-pressed'), 'true');
  await good.page.locator('#music-toggle').click();
  assert.equal(await good.page.locator('#invitation-audio').evaluate(audio => audio.paused), true);
  await good.page.waitForFunction(() => document.getElementById('music-toggle').getAttribute('aria-pressed') === 'false');
  assert.equal(await good.page.locator('#music-toggle').getAttribute('aria-pressed'), 'false');
  await good.page.locator('#music-toggle').click();
  await good.page.waitForFunction(() => !document.getElementById('invitation-audio').paused);
  assert.deepEqual(good.blocked, []);

  const bad = await fixture(t, { config, audio: Buffer.from('This is deliberately not an audio file.') });
  await bad.load();
  await bad.open();
  await bad.page.waitForFunction(() => document.getElementById('invitation-audio').error !== null);
  assert.equal(await bad.page.locator('#music-toggle').getAttribute('aria-pressed'), 'false');
  assert.match(await bad.page.locator('#music-status').innerText(), /no pudo cargar|reproducir/i);
  assert.equal(await bad.page.locator('#music-toggle').isDisabled(), false, 'a failed load leaves a retry control');
  assert.deepEqual(bad.errors, [], 'a failed media request does not crash the invitation');
  assert.deepEqual(bad.blocked, []);
});

test('text remains readable with reduced motion and when JavaScript is unavailable', async t => {
  const reduced = await fixture(t);
  await reduced.load();
  await reduced.open();
  assert.deepEqual(reduced.videoRequests, [], 'reduced motion never downloads the cinematic intro');
  assert.equal(await reduced.page.locator('#intro-video').getAttribute('src'), null);
  assert.equal(await reduced.page.locator('.waiting-entry').count(), 0, 'reduced motion never hides text while waiting for animation');
  const animation = await reduced.page.locator('#name span').first().evaluate(node => ({
    name: getComputedStyle(node).animationName, opacity: getComputedStyle(node).opacity,
  }));
  assert.deepEqual(animation, { name: 'none', opacity: '1' });
  assert.equal(await reduced.page.locator('#motion-toggle').isVisible(), false);
  assert.equal(await reduced.page.locator('[data-floral-motion]').evaluateAll(nodes =>
    nodes.flatMap(node => node.getAnimations({ subtree: true })).some(animation => animation.playState === 'running')),
  false, 'reduced motion suppresses floral animation too');

  const noJS = await fixture(t, { javaScriptEnabled: false, reducedMotion: 'no-preference' });
  const response = await noJS.page.goto(invitationURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  assert.equal(await noJS.page.locator('#envelope-gate').isVisible(), false, 'JavaScript failure does not trap guests under an envelope');
  assert.equal(await noJS.page.locator('#invitation-content').evaluate(node => node.inert), false);
  assert.match(await noJS.page.locator('#name').innerText(), /Alina\s+Fernanda/);
  assert.equal(await noJS.page.locator('#family-title').evaluate(node => getComputedStyle(node).opacity), '1');
  assert.match(await noJS.page.locator('#invitation-content').innerText(), /San José Obrero/);
  assert.equal(await noJS.page.locator('#rsvp-submit').isDisabled(), true);
  assert.deepEqual(noJS.videoRequests, [], 'the no-JavaScript fallback does not download an unused video');
  assert.deepEqual(noJS.blocked, []);
});

test('cinematic intro downloads only after activation, ends accessibly, and releases gesture-authorized music', async t => {
  const { page, load, blocked, errors, videoRequests } = await fixture(t, {
    reducedMotion: 'no-preference', recordMedia: true, audio: silentWav(),
    config: { music: { src: 'assets/acceptance-tone.wav', title: 'Audio sintético de prueba' } },
  });
  await load();
  const video = page.locator('#intro-video');
  assert.deepEqual(videoRequests, [], 'opening the URL loads the poster, not the six-second clip');
  assert.equal(await video.getAttribute('src'), null);
  assert.deepEqual(await video.evaluate(node => ({ muted: node.muted, inline: node.playsInline, paused: node.paused })),
    { muted: true, inline: true, paused: true });
  assert.equal(await page.locator('#skip-intro').isVisible(), false);
  await page.locator('#open-invitation').press('Enter');
  await page.waitForFunction(() => document.getElementById('intro-video').currentTime > 0);
  assert.ok(videoRequests.length > 0, 'the user gesture requests the actual clip');
  assert.equal(await page.locator('#invitation-content').evaluate(node => node.inert), true);
  assert.equal(await page.locator('#envelope-gate').isVisible(), true);
  assert.equal(await page.locator('#skip-intro').isVisible(), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#skip-intro').evaluate(node => document.activeElement === node), true,
    'keyboard users can immediately reach the way out of the intro');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#skip-intro').evaluate(node => document.activeElement === node), true);
  assert.equal(await page.locator('#invitation-audio').evaluate(audio => audio.paused || audio.muted || audio.volume === 0), true,
    'the future song stays inaudible throughout the intro');
  if (process.env.ALINA_SCREENSHOT_DIR) {
    await fs.mkdir(process.env.ALINA_SCREENSHOT_DIR, { recursive: true });
    await page.waitForFunction(() => {
      const video = document.getElementById('intro-video');
      return Number.isFinite(video.duration) && video.currentTime >= video.duration * 0.45;
    });
    await page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, 'intro-playing-390.png') });
  }
  await page.waitForFunction(() => Number.isFinite(window.__acceptanceVideoEnded), null, { timeout: 15000 });
  await page.locator('#envelope-gate').waitFor({ state: 'hidden', timeout: 15000 });
  assert.equal(await page.locator('#invitation-content').evaluate(node => node.inert), false);
  assert.equal(await page.locator('#name').evaluate(node => document.activeElement === node), true);
  await page.waitForFunction(() => {
    const audio = document.getElementById('invitation-audio');
    return !audio.paused && !audio.muted && audio.volume > 0;
  });
  const musicAuthorization = await page.evaluate(() => ({
    first: window.__acceptanceMedia.find(call => call.id === 'invitation-audio'),
    ended: window.__acceptanceVideoEnded,
  }));
  assert.equal(musicAuthorization.first.userActive, true, 'audio was primed while the opening gesture was active');
  assert.equal(musicAuthorization.first.muted, true);
  assert.ok(musicAuthorization.first.at < musicAuthorization.ended);
  if (process.env.ALINA_SCREENSHOT_DIR) {
    await page.waitForFunction(() => [...document.querySelectorAll('.hero-copy *')]
      .flatMap(node => node.getAnimations()).filter(animation => animation.effect.getTiming().iterations !== Infinity)
      .every(animation => animation.playState !== 'running'));
    await page.screenshot({ path: path.join(process.env.ALINA_SCREENSHOT_DIR, 'after-intro-390.png') });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(blocked, []);
});

test('guests can skip the intro and still reach the invitation after playback failure or with data saving', async t => {
  for (const method of ['skip', 'escape']) {
    const { page, load, errors } = await fixture(t, { reducedMotion: 'no-preference' });
    await load();
    await page.locator('#open-invitation').click();
    await page.waitForFunction(() => document.getElementById('intro-video').currentTime > 0);
    if (method === 'skip') await page.locator('#skip-intro').click();
    else await page.keyboard.press('Escape');
    await page.locator('#envelope-gate').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#name').evaluate(node => document.activeElement === node), true);
    assert.equal(await page.locator('#invitation-content').evaluate(node => node.inert), false);
    assert.equal(await page.locator('#intro-video').evaluate(node => node.paused), true, `${method} stops the hidden video`);
    assert.deepEqual(errors, []);
  }
  for (const failure of ['unavailable', 'play-rejected', 'play-stalled']) {
    const failing = await fixture(t, {
      reducedMotion: 'no-preference', videoFailure: failure === 'unavailable',
      rejectVideoPlay: failure === 'play-rejected', stallVideoPlay: failure === 'play-stalled', recordMedia: true,
    });
    await failing.load();
    await failing.open();
    assert.equal(await failing.page.locator('#name').evaluate(node => document.activeElement === node), true,
      `${failure} falls back to readable content instead of trapping the guest`);
    assert.equal(await failing.page.locator('#intro-video').evaluate(node => node.paused), true);
    if (failure === 'unavailable') assert.ok(failing.videoRequests.length > 0);
    else assert.ok(await failing.page.evaluate(() => window.__acceptanceMedia.some(call => call.kind === 'VIDEO')));
    assert.deepEqual(failing.errors, [], 'expected playback problems are handled');
    assert.deepEqual(failing.blocked, []);
  }
  const economical = await fixture(t, { reducedMotion: 'no-preference', saveData: true });
  await economical.load();
  await economical.open();
  assert.deepEqual(economical.videoRequests, [], 'data saving bypasses the video download entirely');
  assert.equal(await economical.page.locator('#intro-video').getAttribute('src'), null);
  assert.equal(await economical.page.locator('#name').evaluate(node => document.activeElement === node), true);
  assert.deepEqual(economical.errors, []);
});

test('transparent flowers load correctly and guests can pause and resume motion without hiding text', async t => {
  const { page, blocked, errors, load, open } = await fixture(t, { reducedMotion: 'no-preference' });
  await load();
  await open();
  const toggle = page.locator('#motion-toggle');
  assert.equal(await toggle.isVisible(), true);
  assert.match(await toggle.getAttribute('aria-label'), /Pausar animación/);
  await page.waitForFunction(() => [...document.querySelectorAll('[data-floral-motion]')].some(node =>
    node.getAnimations({ subtree: true }).some(animation =>
      animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity)));

  const decorativeImages = await page.locator('[data-floral-motion][aria-hidden="true"] img').evaluateAll(images =>
    [...new Set(images.map(image => image.currentSrc || image.src))]);
  assert.ok(decorativeImages.length > 0, 'decorative flowers are separate image layers');
  // Check decoded alpha pixels, not only a file extension or PNG metadata.
  // The optimized images and retained PNG originals must both preserve transparency.
  const alphaResults = await page.evaluate(async sources => {
    const files = [...new Set(sources.flatMap(source => [source, source.replace(/\.webp(?=$|\?)/, '.png')]))];
    return Promise.all(files.map(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, 128, 128);
      const pixels = context.getImageData(0, 0, 128, 128).data;
      let transparent = 0, visible = 0;
      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] === 0) transparent++;
        if (pixels[index] > 200) visible++;
      }
      return { src, transparent, visible };
    }));
  }, decorativeImages);
  for (const image of alphaResults) {
    assert.ok(image.transparent > 0, `${image.src} has a transparent background`);
    assert.ok(image.visible > 0, `${image.src} contains visible flowers`);
  }

  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  assert.match(await toggle.getAttribute('aria-label'), /Reanudar animación/);
  await page.waitForFunction(() => [...document.querySelectorAll('.text-motion')]
    .every(node => getComputedStyle(node).opacity === '1'));
  assert.equal(await page.locator('.waiting-entry').count(), 0, 'pausing exposes text that had not entered the viewport');
  assert.equal(await page.locator('[data-floral-motion]').evaluateAll(nodes =>
    nodes.flatMap(node => node.getAnimations({ subtree: true })).some(animation =>
      animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity)),
  false, 'no decorative flower keeps moving after pause');
  assert.deepEqual(await page.locator('#invitation-content [data-floral-motion][aria-hidden="true"]').evaluateAll(nodes =>
    nodes.filter(node => Number(getComputedStyle(node).opacity) <= 0.01
      || Number(getComputedStyle(node.querySelector('img')).opacity) <= 0.01).map(node => node.className)),
  [], 'pausing does not freeze unrevealed flowers in their invisible first animation frame');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => document.getElementById('reading-progress').getBoundingClientRect().width <= 1);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForFunction(() => document.getElementById('reading-progress').getBoundingClientRect().width >= innerWidth * 0.98);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  // Returning to the hero ensures an on-screen flower is available to animate.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.waiting-entry').count(), 0, 'resuming never hides text the guest has already revealed');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-floral-motion]')].some(node =>
    node.getAnimations({ subtree: true }).some(animation =>
      animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity)));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toggle.waitFor({ state: 'hidden' });
  assert.equal(await page.locator('[data-floral-motion]').evaluateAll(nodes =>
    nodes.flatMap(node => node.getAnimations({ subtree: true })).some(animation => animation.playState === 'running')),
  false, 'changing the system preference stops motion immediately');
  assert.equal(await page.locator('.waiting-entry').count(), 0);
  assert.deepEqual(blocked, []);
  assert.deepEqual(errors, []);
});
