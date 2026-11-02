import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

// Same loader as guest-pass.browser.mjs: the web has no Playwright dependency of its own.
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));

const BASE = new URL(process.env.BASE_URL || 'http://127.0.0.1:3210');
assert.equal(BASE.hostname, '127.0.0.1', 'this suite may only use the isolated loopback server');
assert.equal(BASE.protocol, 'http:');
const QUERY = '?utm_source=chatgpt&utm_medium=paid&utm_campaign=villaverde_eventos';
const KEY = 'villaverde_analytics_consent_v2';
const LEGACY = 'villaverde_analytics_consent';
const EVENT = 'villaverde:analytics-consent';
const MARKER = '[VV-REF:chatgpt_ads:villaverde_eventos:v1]';
const NOW = 1_800_000_000_000;
const TTL = 1_800_000;
const SELECTOR = 'a[href^="https://wa.me/529995485862"]';
const PLACEHOLDER = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#16392b"/></svg>';
let originalLinks;
let serverLinks;
let passed = 0;

async function eventually(read, predicate, message) {
  const deadline = Date.now() + 5000;
  let last;
  do {
    last = await read();
    if (predicate(last)) return last;
    await delay(35);
  } while (Date.now() < deadline);
  assert.fail(message + '\nLast value: ' + JSON.stringify(last));
}

const links = page => page.locator(SELECTOR).evaluateAll(anchors => anchors.map(anchor => ({
  href: anchor.getAttribute('href'),
  label: anchor.textContent,
})));

async function assertOriginals(page) {
  const actual = await eventually(() => links(page), values => values.length === 11 &&
    values.every((value, index) => value.href === originalLinks[index].href), 'all eleven hrefs must remain original');
  assert.deepEqual(actual, originalLinks);
}

async function assertMarked(page) {
  const actual = await eventually(() => links(page), values => values.length === 11 && values.every(value => {
    const text = new URL(value.href).searchParams.get('text');
    return text?.endsWith('\n' + MARKER);
  }), 'all eleven hrefs must carry the final reference');
  for (let index = 0; index < actual.length; index++) {
    const before = new URL(originalLinks[index].href);
    const after = new URL(actual[index].href);
    assert.equal(after.protocol, 'https:');
    assert.equal(after.host, 'wa.me');
    assert.equal(after.pathname, '/529995485862');
    assert.equal(actual[index].label, originalLinks[index].label);
    const greeting = before.searchParams.get('text') || 'Hola, quiero información de Villaverde';
    const payload = after.searchParams.get('text');
    assert.equal(payload, greeting + '\n' + MARKER);
    assert.equal(payload.split('[VV-REF:').length - 1, 1);
    assert.equal(payload.split(/\r?\n/).at(-1), MARKER);
    assert.ok(payload.length <= 4096);
    assert.ok(/\S/.test(payload.slice(0, -MARKER.length)));
  }
}

async function activate(page, type = 'click') {
  await page.locator(SELECTOR).evaluateAll((anchors, eventType) => {
    for (const anchor of anchors) {
      // Do not open WhatsApp, a new window, or an actual outbound request.
      anchor.addEventListener(eventType, event => event.preventDefault(), { once: true });
      anchor.dispatchEvent(new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        button: eventType === 'auxclick' ? 1 : eventType === 'contextmenu' ? 2 : 0,
      }));
    }
  }, type);
}

async function pageFixture(browser, options = {}) {
  const entries = Object.entries(options.storage || {}).map(([name, value]) => ({ name, value }));
  const context = await browser.newContext({
    javaScriptEnabled: options.javaScriptEnabled !== false,
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 900 },
    storageState: { cookies: [], origins: [{ origin: BASE.origin, localStorage: entries }] },
  });
  const blocked = [];
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === BASE.origin && url.pathname !== '/_next/image') return route.continue();
    blocked.push({ origin: url.origin, path: url.pathname, type: request.resourceType() });
    if (url.pathname === '/_next/image' || request.resourceType() === 'image') {
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: PLACEHOLDER });
    }
    const contentType = request.resourceType() === 'script' ? 'application/javascript' :
      request.resourceType() === 'stylesheet' ? 'text/css' : 'text/plain';
    return route.fulfill({ status: 200, contentType, body: '' });
  });
  await context.addInitScript(({ key, failStorage }) => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    window.__syntheticWrites = [];
    Storage.prototype.setItem = function(name, value) {
      window.__syntheticWrites.push({ key: String(name), value: String(value) });
      if (failStorage && name === key) throw new Error('Synthetic failed preference write');
      return setItem.call(this, name, value);
    };
    if (failStorage) {
      Storage.prototype.getItem = function(name) {
        if (name === key) throw new Error('Synthetic failed preference read');
        return getItem.call(this, name);
      };
    }
    window.__restoreSyntheticStorage = () => {
      Storage.prototype.getItem = getItem;
      Storage.prototype.setItem = setItem;
    };
    window.__storedConsent = () => getItem.call(localStorage, key);
  }, { key: KEY, failStorage: !!options.failStorage });
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydration|didn't match|server rendered HTML/i.test(message.text())) errors.push(message.text());
  });
  if (options.clock === 'timer') {
    await page.clock.install({ time: new Date(NOW) });
    await page.clock.pauseAt(new Date(NOW));
  } else if (options.clock === 'fixed') {
    await page.clock.setFixedTime(new Date(NOW));
  }
  await page.goto(BASE.origin + '/' + (options.query ?? QUERY), { waitUntil: 'load' });
  if (options.javaScriptEnabled !== false) {
    // The eleventh deployed CTA is intentionally mounted only after leaving the hero.
    // Repeat the real scroll event until the client listener has hydrated.
    await eventually(async () => {
      await page.evaluate(() => {
        const hero = document.getElementById('inicio');
        window.scrollTo(0, (hero?.getBoundingClientRect().bottom ?? 900) + window.scrollY + 100);
        window.dispatchEvent(new Event('scroll'));
      });
      return page.locator(SELECTOR).count();
    }, count => count === 11, 'the conditional mobile CTA must mount after scrolling');
  }
  return { page, context, blocked, errors };
}

async function noCampaignStorage(page) {
  const writes = await page.evaluate(() => window.__syntheticWrites);
  assert.ok(writes.every(write => write.key === KEY && ['accepted', 'rejected'].includes(write.value)),
    'no campaign, URL, referrer, visit timestamps or identifiers may be written to browser storage: ' + JSON.stringify(writes));
}

async function run(browser, name, options, action) {
  const fixture = await pageFixture(browser, options);
  try {
    await action(fixture);
    if (options.javaScriptEnabled !== false) await noCampaignStorage(fixture.page);
    assert.deepEqual(fixture.errors, [], 'no runtime or hydration errors');
    passed++;
    console.log('PASS ' + name);
  } finally {
    await fixture.context.close();
  }
}

const browser = await chromium.launch({ headless: true, args: ['--disable-background-networking'] });
try {
  await run(browser, 'SSR starts with ten original links before the conditional sticky CTA mounts',
    { javaScriptEnabled: false, storage: { [KEY]: 'accepted' } }, async ({ page }) => {
      serverLinks = await links(page);
      assert.equal(serverLinks.length, 10);
      for (const link of serverLinks) assert.equal(new URL(link.href).searchParams.get('text').includes(MARKER), false);
    });

  await run(browser, 'legacy acceptance does not hide the v2 notice or enable attribution',
    { storage: { [LEGACY]: 'accepted' } }, async ({ page }) => {
      originalLinks = await links(page);
      assert.equal(originalLinks.length, 11);
      assert.deepEqual(originalLinks.slice(0, 10), serverLinks, 'hydration must preserve every SSR href and label');
      await assertOriginals(page);
      await page.getByRole('complementary', { name: 'Preferencias de privacidad' }).waitFor({ state: 'visible' });
      assert.match(await page.locator('.privacy-choice').textContent(), /Meta Pixel y una referencia en WhatsApp/);
      await page.getByRole('button', { name: 'Aceptar medición publicitaria' }).click();
      await assertMarked(page);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), 'accepted');
    });

  await run(browser, 'v2 acceptance preserves all eleven messages across repeated click, auxiliary click and context menu',
    { storage: { [KEY]: 'accepted' } }, async ({ page }) => {
      await assertMarked(page);
      for (let repetition = 0; repetition < 3; repetition++) {
        for (const type of ['click', 'auxclick', 'contextmenu']) {
          await activate(page, type);
          await assertMarked(page);
        }
      }
    });

  await run(browser, 'unknown and rejected consent stay normal; storage and consent events revalidate revocation',
    {}, async ({ page }) => {
      await assertOriginals(page);
      await page.getByRole('button', { name: 'Continuar sin medición publicitaria' }).click();
      await assertOriginals(page);
      await page.evaluate(({ key }) => {
        localStorage.setItem(key, 'accepted');
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: 'accepted' }));
      }, { key: KEY });
      await assertMarked(page);
      await page.evaluate(({ key, event }) => {
        localStorage.setItem(key, 'rejected');
        window.dispatchEvent(new Event(event));
      }, { key: KEY, event: EVENT });
      await assertOriginals(page);
      await activate(page, 'contextmenu');
      await assertOriginals(page);
    });

  await run(browser, 'failed rejection write overrides the older acceptance for the rest of this visit',
    { storage: { [KEY]: 'accepted' }, failStorage: true }, async ({ page }) => {
      await assertOriginals(page);
      await page.getByRole('button', { name: 'Continuar sin medición publicitaria' }).click();
      await page.evaluate(event => {
        window.__restoreSyntheticStorage();
        window.dispatchEvent(new Event(event));
      }, EVENT);
      assert.equal(await page.evaluate(() => window.__storedConsent()), 'accepted');
      await activate(page);
      await assertOriginals(page);
      assert.equal(await page.locator('html').getAttribute('data-analytics-choice'), 'rejected');
    });

  await run(browser, 'an explicit acceptance can work only in memory when storage is unavailable',
    { failStorage: true }, async ({ page }) => {
      await assertOriginals(page);
      await page.getByRole('button', { name: 'Aceptar medición publicitaria' }).click();
      await assertMarked(page);
      assert.equal(await page.evaluate(() => window.__storedConsent()), null);
    });

  await run(browser, 'the exact thirty-minute timer expires without renewal by interaction',
    { storage: { [KEY]: 'accepted' }, clock: 'timer' }, async ({ page }) => {
      await assertMarked(page);
      await page.clock.fastForward(TTL - 1);
      await activate(page, 'contextmenu');
      await assertMarked(page);
      await page.clock.fastForward(1);
      await assertOriginals(page);
    });

  await run(browser, 'a suspended tab expires on pageshow and cannot be resurrected by later events',
    { storage: { [KEY]: 'accepted' }, clock: 'fixed' }, async ({ page }) => {
      await assertMarked(page);
      await page.clock.setFixedTime(new Date(NOW + TTL));
      await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
      await assertOriginals(page);
      await page.clock.setFixedTime(new Date(NOW + 10));
      await page.evaluate(event => window.dispatchEvent(new Event(event)), EVENT);
      await activate(page, 'auxclick');
      await assertOriginals(page);
    });

  for (const kind of ['invalid', 'backwards']) {
    await run(browser, 'a ' + kind + ' clock clears the candidate permanently',
      { storage: { [KEY]: 'accepted' }, clock: 'fixed' }, async ({ page }) => {
        await assertMarked(page);
        await page.evaluate(({ now, invalid }) => {
          window.__syntheticOriginalNow = Date.now;
          Date.now = () => invalid ? NaN : now - 1;
          window.dispatchEvent(new Event('pageshow'));
        }, { now: NOW, invalid: kind === 'invalid' });
        await assertOriginals(page);
        await page.evaluate(() => {
          Date.now = window.__syntheticOriginalNow;
          window.dispatchEvent(new Event('pageshow'));
        });
        await activate(page, 'contextmenu');
        await assertOriginals(page);
      });
  }

  await run(browser, 'temporary invalid URL, return navigation and a new untagged load never restore attribution',
    { storage: { [KEY]: 'accepted' } }, async ({ page }) => {
      await assertMarked(page);
      await page.evaluate(query => {
        history.replaceState(null, '', '/?utm_source=chatgpt');
        history.replaceState(null, '', '/' + query);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, QUERY);
      await assertOriginals(page);
      await activate(page);
      await assertOriginals(page);
      await page.goto(BASE.origin + '/', { waitUntil: 'load' });
      await eventually(async () => {
        await page.evaluate(() => {
          const hero = document.getElementById('inicio');
          window.scrollTo(0, (hero?.getBoundingClientRect().bottom ?? 900) + window.scrollY + 100);
          window.dispatchEvent(new Event('scroll'));
        });
        return page.locator(SELECTOR).count();
      }, count => count === 11, 'new untagged load should keep its conditional CTA');
      await assertOriginals(page);
      await activate(page, 'auxclick');
      await assertOriginals(page);
    });

  console.log(JSON.stringify({ passed, externalRequests: 'intercepted before network', unmountCleanup: 'source review required; no isolated mount harness exposed' }));
} finally {
  await browser.close();
}
