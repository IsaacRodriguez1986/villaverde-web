import assert from 'node:assert/strict';
import test from 'node:test';

const KEY = 'villaverde_analytics_consent_v2';
const LEGACY = 'villaverde_analytics_consent';
const EVENT = 'villaverde:analytics-consent';
let sequence = 0;

async function fixture(t, saved = {}) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const values = new Map(Object.entries(saved));
  const writes = [];
  const storage = { failRead: false, failWrite: false };
  const browser = new EventTarget();
  browser.Event = Event;
  browser.CustomEvent = CustomEvent;
  browser.localStorage = {
    getItem(key) {
      if (storage.failRead) throw new Error('Synthetic storage read failure');
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      writes.push([key, value]);
      if (storage.failWrite) throw new Error('Synthetic storage write failure');
      values.set(key, String(value));
    },
  };
  browser.document = { documentElement: { dataset: {} } };
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: browser });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else delete globalThis.window;
  });
  const preferences = await import('../src/features/landing/analytics-consent.ts?test=' + ++sequence);
  return { browser, preferences, storage, values, writes };
}

test('the new consent version ignores a legacy acceptance and does not write while reading', async t => {
  const { preferences, writes, values } = await fixture(t, { [LEGACY]: 'accepted' });
  assert.equal(preferences.ANALYTICS_CONSENT_STORAGE_KEY, KEY);
  assert.equal(preferences.ANALYTICS_CONSENT_EVENT, EVENT);
  assert.equal(preferences.getAnalyticsConsent(), null);
  assert.equal(values.get(LEGACY), 'accepted');
  assert.deepEqual(writes, []);
});

for (const value of ['accepted', 'rejected']) {
  test('recognizes an explicit v2 ' + value, async t => {
    const { preferences } = await fixture(t, { [KEY]: value, [LEGACY]: value === 'accepted' ? 'rejected' : 'accepted' });
    assert.equal(preferences.getAnalyticsConsent(), value);
  });
}

for (const value of ['', 'ACCEPTED', ' accepted', 'rejected ', 'unknown']) {
  test('treats an invalid saved choice as unknown: ' + JSON.stringify(value), async t => {
    const { preferences } = await fixture(t, { [KEY]: value, [LEGACY]: 'accepted' });
    assert.equal(preferences.getAnalyticsConsent(), null);
  });
}

test('a failed first read stays unknown, even if a legacy acceptance exists', async t => {
  const { preferences, storage, writes } = await fixture(t, { [LEGACY]: 'accepted', [KEY]: 'accepted' });
  storage.failRead = true;
  assert.equal(preferences.getAnalyticsConsent(), null);
  assert.deepEqual(writes, []);
});

test('can retain an already known choice when a later storage read fails', async t => {
  const { preferences, storage } = await fixture(t, { [KEY]: 'accepted' });
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  storage.failRead = true;
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
});

test('an explicit acceptance works for this visit even when persistence fails', async t => {
  const { preferences, storage, values, writes, browser } = await fixture(t, { [KEY]: 'rejected' });
  let notifications = 0;
  browser.addEventListener(EVENT, () => notifications++);
  storage.failWrite = true;
  preferences.saveAnalyticsConsent('accepted');
  assert.equal(values.get(KEY), 'rejected');
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  assert.deepEqual(writes, [[KEY, 'accepted']]);
  assert.equal(notifications, 1);
});

test('a rejected choice in memory overrides an older persisted acceptance after a failed write', async t => {
  const { preferences, storage, values, browser } = await fixture(t, { [KEY]: 'accepted' });
  let notifications = 0;
  browser.addEventListener(EVENT, () => notifications++);
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  storage.failWrite = true;
  preferences.saveAnalyticsConsent('rejected');
  assert.equal(values.get(KEY), 'accepted');
  assert.equal(preferences.getAnalyticsConsent(), 'rejected');
  assert.equal(preferences.getAnalyticsConsent(), 'rejected');
  storage.failRead = true;
  assert.equal(preferences.getAnalyticsConsent(), 'rejected');
  storage.failRead = false;
  storage.failWrite = false;
  preferences.saveAnalyticsConsent('accepted');
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  assert.equal(notifications, 2);
});

test('external revocation and removal are observed instead of caching an acceptance indefinitely', async t => {
  const { preferences, values } = await fixture(t, { [KEY]: 'accepted' });
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  values.set(KEY, 'rejected');
  assert.equal(preferences.getAnalyticsConsent(), 'rejected');
  values.delete(KEY);
  assert.equal(preferences.getAnalyticsConsent(), null);
});

for (const change of [
  { key: KEY, newValue: 'rejected', expected: 'rejected' },
  { key: KEY, newValue: null, expected: null },
  { key: null, newValue: null, expected: null },
]) {
  test('a known storage revocation survives a failed read: ' + JSON.stringify(change), async t => {
    const { preferences, storage } = await fixture(t, { [KEY]: 'accepted' });
    assert.equal(preferences.getAnalyticsConsent(), 'accepted');
    storage.failRead = true;
    assert.equal(preferences.getAnalyticsConsent(change), change.expected);
    assert.equal(preferences.getAnalyticsConsent(), change.expected);
  });
}

test('unrelated and legacy storage signals do not revoke a known v2 decision', async t => {
  const { preferences, storage } = await fixture(t, { [KEY]: 'accepted' });
  assert.equal(preferences.getAnalyticsConsent(), 'accepted');
  storage.failRead = true;
  assert.equal(preferences.getAnalyticsConsent({ key: 'unrelated_preference', newValue: 'rejected' }), 'accepted');
  assert.equal(preferences.getAnalyticsConsent({ key: LEGACY, newValue: 'rejected' }), 'accepted');
});

test('a failed explicit rejection remains authoritative over a later accepted storage signal', async t => {
  const { preferences, storage } = await fixture(t, { [KEY]: 'accepted' });
  storage.failWrite = true;
  preferences.saveAnalyticsConsent('rejected');
  assert.equal(preferences.getAnalyticsConsent({ key: KEY, newValue: 'accepted' }), 'rejected');
});

test('saving uses only the v2 key and announces each explicit decision', async t => {
  const { preferences, writes, values, browser } = await fixture(t, { [LEGACY]: 'accepted' });
  let notifications = 0;
  browser.addEventListener(EVENT, () => notifications++);
  preferences.saveAnalyticsConsent('accepted');
  preferences.saveAnalyticsConsent('rejected');
  assert.deepEqual(writes, [[KEY, 'accepted'], [KEY, 'rejected']]);
  assert.equal(values.get(LEGACY), 'accepted');
  assert.equal(values.get(KEY), 'rejected');
  assert.equal(notifications, 2);
});

test('server reads remain unknown and never require window or storage', async t => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  delete globalThis.window;
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else delete globalThis.window;
  });
  const preferences = await import('../src/features/landing/analytics-consent.ts?server=' + ++sequence);
  assert.equal(preferences.getAnalyticsConsent(), null);
  assert.doesNotThrow(() => preferences.saveAnalyticsConsent('accepted'));
  assert.equal(preferences.getAnalyticsConsent(), null);
});
