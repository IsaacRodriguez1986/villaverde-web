import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ATTRIBUTION_TTL_MS,
  CHATGPT_REFERENCE,
  attributedWhatsAppUrl,
  captureChatGPTVisit,
  hasChatGPTPaidQuery,
  validateChatGPTVisit,
} from '../src/features/landing/chatgpt-attribution.ts';

const VALID = '?utm_source=chatgpt&utm_medium=paid&utm_campaign=villaverde_eventos';
const MARKER = '[VV-REF:chatgpt_ads:villaverde_eventos:v1]';
const NOW = 1_800_000_000_000;
const original = message => 'https://wa.me/529995485862?text=' + encodeURIComponent(message);

test('accepts only the exact paid campaign and does not infer an organic visit', () => {
  assert.equal(CHATGPT_REFERENCE, MARKER);
  assert.equal(ATTRIBUTION_TTL_MS, 1_800_000);
  assert.equal(hasChatGPTPaidQuery(VALID), true);
  assert.equal(hasChatGPTPaidQuery(VALID + '&language=es&source=irrelevant'), true);
  assert.equal(hasChatGPTPaidQuery('?utm_campaign=villaverde_eventos&utm_medium=paid&utm_source=chatgpt'), true);
  for (const search of ['', '?source=chatgpt_ads', '?referrer=https%3A%2F%2Fchatgpt.com', '?utm_source=chatgpt']) {
    assert.equal(hasChatGPTPaidQuery(search), false, search);
  }
});

test('rejects missing, duplicate, altered or incomplete attribution parameters', () => {
  const invalid = [
    '?utm_source=chatgpt&utm_medium=paid',
    '?utm_source=chatgpt&utm_campaign=villaverde_eventos',
    '?utm_medium=paid&utm_campaign=villaverde_eventos',
    VALID + '&utm_source=chatgpt',
    VALID + '&utm_medium=paid',
    VALID + '&utm_campaign=villaverde_eventos',
    VALID + '&utm_source=other',
    VALID.replace('chatgpt', 'ChatGPT'),
    VALID.replace('paid', 'PAID'),
    VALID.replace('villaverde_eventos', 'Villaverde_eventos'),
    VALID.replace('villaverde_eventos', 'another_campaign'),
    VALID.replace('utm_source', 'UTM_SOURCE'),
    VALID.replace('utm_medium', 'Utm_medium'),
    VALID.replace('utm_campaign', 'utm_Campaign'),
    VALID.replace('chatgpt', 'chatgpt+'),
    VALID.replace('paid', '%20paid'),
    VALID.replace('villaverde_eventos', 'villaverde_eventos%20'),
    VALID.replace('chatgpt', ''),
  ];
  for (const search of invalid) assert.equal(hasChatGPTPaidQuery(search), false, search);
});

test('rejects every additional UTM and competing click signal case-insensitively', () => {
  for (const key of ['utm_term', 'utm_content', 'UTM_OTHER', 'UtM_Source', 'utm_', 'UTM_MEDIUM']) {
    assert.equal(hasChatGPTPaidQuery(VALID + '&' + key + '=extra'), false, key);
  }
  for (const key of ['fbclid', 'gclid', 'dclid', 'msclkid', 'ttclid', 'ctwa_clid']) {
    for (const spelling of [key, key.toUpperCase(), key[0].toUpperCase() + key.slice(1)]) {
      assert.equal(hasChatGPTPaidQuery(VALID + '&' + spelling + '=synthetic'), false, spelling);
      assert.equal(hasChatGPTPaidQuery(VALID + '&' + spelling + '='), false, spelling + ' empty');
    }
  }
  assert.equal(hasChatGPTPaidQuery(VALID + '&fb%63lid=synthetic'), false);
});

test('retains only two times in memory and enforces the exact half-open TTL', () => {
  const candidate = captureChatGPTVisit(VALID, NOW);
  assert.deepEqual(candidate, { capturedAt: NOW, expiresAt: NOW + 1_800_000 });
  assert.deepEqual(Object.keys(candidate).sort(), ['capturedAt', 'expiresAt']);
  assert.deepEqual(validateChatGPTVisit(candidate, VALID, NOW), candidate);
  assert.deepEqual(validateChatGPTVisit(candidate, VALID, NOW + 1_799_999), candidate);
  assert.equal(validateChatGPTVisit(candidate, VALID, NOW + 1_800_000), null);
  assert.equal(validateChatGPTVisit(candidate, VALID, NOW + 1_800_001), null);
  assert.equal(validateChatGPTVisit(candidate, VALID, NOW - 1), null);
  assert.equal(candidate.expiresAt, NOW + 1_800_000, 'interaction must not renew the original expiry');
});

test('invalid clocks, invalidated navigation and a new untagged load cannot create attribution', () => {
  for (const invalidClock of [NaN, Infinity, -Infinity]) {
    assert.equal(captureChatGPTVisit(VALID, invalidClock), null);
    assert.equal(validateChatGPTVisit(captureChatGPTVisit(VALID, NOW), VALID, invalidClock), null);
  }
  let candidate = captureChatGPTVisit(VALID, NOW);
  candidate = validateChatGPTVisit(candidate, '?utm_source=chatgpt', NOW + 1);
  assert.equal(candidate, null);
  candidate = validateChatGPTVisit(candidate, VALID, NOW + 2);
  assert.equal(candidate, null, 'a previously cleared candidate cannot be resurrected');
  assert.equal(captureChatGPTVisit('', NOW + 3), null, 'another load must not inherit a previous campaign');
});

test('rejects out-of-range or fractional clocks and an expiry outside the valid Date range', () => {
  const maxDate = 8_640_000_000_000_000;
  const ttl = 1_800_000;
  for (const invalidClock of [Number.MAX_SAFE_INTEGER, maxDate, maxDate - 1000, NOW + 0.5]) {
    assert.equal(captureChatGPTVisit(VALID, invalidClock), null, String(invalidClock));
  }
  for (const forged of [
    { capturedAt: NOW, expiresAt: Number.MAX_SAFE_INTEGER },
    { capturedAt: maxDate - 1000, expiresAt: maxDate - 1000 + ttl },
    { capturedAt: NOW + 0.5, expiresAt: NOW + 0.5 + ttl },
    { capturedAt: NOW, expiresAt: NOW + ttl + 0.5 },
  ]) assert.equal(validateChatGPTVisit(forged, VALID, NOW), null);
  const lastValidWindow = captureChatGPTVisit(VALID, maxDate - ttl);
  assert.deepEqual(lastValidWindow, { capturedAt: maxDate - ttl, expiresAt: maxDate });
  assert.deepEqual(validateChatGPTVisit(lastValidWindow, VALID, maxDate - 1), lastValidWindow);
  assert.equal(validateChatGPTVisit(lastValidWindow, VALID, maxDate), null);
});

test('preserves the deployed WhatsApp message and destination, appending one final reference', () => {
  const messages = [
    'Hola, quiero consultar disponibilidad de fecha para mi evento en Villaverde.',
    'Hola, quiero consultar disponibilidad de fecha con el Paquete ESMERALDA de Villaverde.',
    'Hola, quiero consultar disponibilidad de fecha con el Paquete DIAMANTE de Villaverde.',
    'Hola, quiero consultar disponibilidad de fecha con el Paquete PLATINO de Villaverde.',
    '¿Tienen fecha?\nQuiero información para mi evento & detalles.',
  ];
  for (const message of messages) {
    const href = original(message);
    const result = new URL(attributedWhatsAppUrl(href, true));
    assert.equal(result.protocol, 'https:');
    assert.equal(result.host, 'wa.me');
    assert.equal(result.pathname, '/529995485862');
    assert.equal(result.searchParams.get('text'), message + '\n' + MARKER);
    assert.equal(result.searchParams.getAll('text').length, 1);
    const activations = Array.from({ length: 4 }, () => attributedWhatsAppUrl(href, true));
    assert.ok(activations.every(value => value === result.href), 'every activation starts from the original href');
    assert.equal(result.searchParams.get('text').split('[VV-REF:').length - 1, 1);
    assert.equal(result.searchParams.get('text').split('\n').at(-1), MARKER);
  }
});

test('uses the required default greeting only when the eligible link has no text', () => {
  for (const href of ['https://wa.me/529995485862', 'https://wa.me/529995485862?text=']) {
    assert.equal(new URL(attributedWhatsAppUrl(href, true)).searchParams.get('text'),
      'Hola, quiero información de Villaverde\n' + MARKER);
  }
  const withOtherParameter = original('Consulta sintética') + '&lang=es';
  assert.equal(new URL(attributedWhatsAppUrl(withOtherParameter, true)).searchParams.get('lang'), 'es');
});

test('unknown consent, rejected consent or ineligible destinations keep the original href byte-for-byte', () => {
  const eligible = original('Consulta sintética');
  assert.equal(attributedWhatsAppUrl(eligible, false), eligible);
  for (const href of [
    'http://wa.me/529995485862?text=hola',
    'https://wa.me/529995485863?text=hola',
    'https://wa.me/529995485862/?text=hola',
    'https://wa.me/another?text=hola',
    'https://example.test/529995485862?text=hola',
    'https://wa.me.example.test/529995485862?text=hola',
    '/529995485862?text=hola',
    'mailto:example@example.test',
    'not a URL',
  ]) assert.equal(attributedWhatsAppUrl(href, true), href, href);
});

test('the constructed payload has the exact editable greeting and final-line bot contract for LF and CRLF', () => {
  const payload = new URL(attributedWhatsAppUrl(original('Hola, cambié mi saludo'), true)).searchParams.get('text');
  for (const body of [payload, payload.replaceAll('\n', '\r\n')]) {
    const lines = body.split(/\r?\n/);
    assert.ok(lines.length >= 2);
    assert.equal(lines.at(-1), MARKER);
    assert.match(lines.slice(0, -1).join('\n'), /\S/);
    assert.equal(lines.slice(0, -1).join('\n').includes('[VV-REF:'), false);
    assert.ok(body.length <= 4096);
  }
});
