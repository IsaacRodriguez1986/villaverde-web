import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const base = process.env.EVENTUS_TEST_URL || 'http://localhost:3210';
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const requests = [], errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.route('**/api/eventus*', route => route.fulfill({ json: {
      event: { code: 'EVT-TEST', name: 'Fiesta de prueba', type: 'xv', date: '2027-05-01' },
      guest: { id: 1, name: 'Invitada de prueba', status: 'confirmed', companions: 2, mesa: 1 },
    } }));
    await page.goto(`${base}/rsvp/EVT-TEST/1#token=fixture-private-token`);
    const qr = page.getByRole('img', { name: 'Código QR de tu pase privado para recepción' });
    await qr.waitFor();
    const consent = page.getByRole('button', { name: 'Continuar sin medición' });
    if (await consent.isVisible()) await consent.click();
    assert.match(await qr.getAttribute('src'), /^data:image\/gif;base64,/);
    assert.equal(await qr.evaluate(img => img.complete && img.naturalWidth > 0), true);
    assert.equal(await page.getByRole('link', { name: 'Guardar pase QR' }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(requests.some(request => new URL(request.url).pathname === '/api/eventus' && request.method !== 'GET'), false, 'Opening pass must not check in');
    assert.equal(requests.some(request => !request.url.startsWith(base) && request.url.includes('fixture-private-token')), false);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/tmp/eventus-guest-pass-${width}.png`, fullPage: true });
    await page.close();
    console.log(`Guest pass ${width}px: QR rendered, downloadable, private and no check-in side effect`);
  }
} finally { await browser.close(); }
