import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as attribution from '../src/features/landing/chatgpt-attribution.ts';

const query = '?utm_source=chatgpt&utm_medium=paid&utm_campaign=villaverde_eventos';
const source = await readFile(new URL('../src/features/landing/whatsapp-attribution.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;

function lifecycle() {
  let now = 1_000_000;
  let choice = 'accepted';
  let contextValue;
  const effects = [];
  const updates = [];
  const listeners = new Map();
  const timers = new Map();
  const window = {
    location: { search: query },
    setTimeout(fn, delay) { timers.set(1, { fn, delay }); return 1; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(name, listener) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(listener); },
    removeEventListener(name, listener) { listeners.get(name)?.delete(listener); },
    history: {
      pushState(_data, _unused, url) { window.location.search = new URL(url, 'https://example.test').search; },
      replaceState(_data, _unused, url) { window.location.search = new URL(url, 'https://example.test').search; },
    },
  };
  const originalPush = window.history.pushState;
  const originalReplace = window.history.replaceState;
  const react = {
    createContext() { return { Provider: 'test-provider' }; },
    useRef(value) { return { current: value }; },
    useCallback(fn) { return fn; },
    useMemo(fn) { return fn(); },
    useState(value) { return [value, next => updates.push(next)]; },
    useEffect(fn) { effects.push(fn); },
    useContext() { return contextValue; },
  };
  const jsx = (type, props) => { if (type === 'test-provider') contextValue = props.value; return { type, props }; };
  const module = { exports: {} };
  const scope = {
    exports: module.exports, module, window,
    Date: class extends Date { static now() { return now; } },
    StorageEvent: class {},
    require(id) {
      if (id === 'react') return react;
      if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (id === './analytics-consent') return { ANALYTICS_CONSENT_EVENT: 'villaverde:analytics-consent', getAnalyticsConsent: () => choice };
      if (id === './chatgpt-attribution') return attribution;
      throw new Error('Unexpected dependency in isolated lifecycle: ' + id);
    },
  };
  vm.runInNewContext(compiled, scope);
  return {
    exports: module.exports, window, timers, listeners, updates, effects, originalPush, originalReplace,
    now(value) { now = value; },
    consent(value) { choice = value; },
    context: () => contextValue,
  };
}

test('initial render is normal; every activation uses the original href and cleanup releases listeners/timer/history', () => {
  const state = lifecycle();
  state.exports.WhatsAppAttributionProvider({ children: null });
  assert.equal(state.context().enabled, false);
  assert.equal(state.listeners.size, 0);
  assert.equal(state.timers.size, 0);
  const original = 'https://wa.me/529995485862?text=Hola%20Villaverde';
  const link = state.exports.AttributedWhatsAppLink({ href: original });
  assert.equal(link.props.href, original);
  const cleanup = state.effects[0]();
  assert.equal(state.updates.at(-1), true);
  assert.deepEqual([...state.listeners.keys()].sort(), ['pageshow', 'popstate', 'storage', 'villaverde:analytics-consent']);
  assert.equal(state.timers.get(1).delay, attribution.ATTRIBUTION_TTL_MS);
  const element = { href: original };
  for (const handler of ['onClick', 'onAuxClick', 'onContextMenu', 'onClick']) link.props[handler]({ currentTarget: element });
  const text = new URL(element.href).searchParams.get('text');
  assert.equal(text, 'Hola Villaverde\n' + attribution.CHATGPT_REFERENCE);
  cleanup();
  assert.equal([...state.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0);
  assert.equal(state.timers.size, 0);
  assert.equal(state.window.history.pushState, state.originalPush);
  assert.equal(state.window.history.replaceState, state.originalReplace);
  const updateCount = state.updates.length;
  assert.equal(state.context().revalidate(), false);
  assert.equal(state.updates.length, updateCount);
});

test('expiry and temporary invalid navigation permanently destroy a candidate without renewing it', () => {
  for (const invalidate of ['expiry', 'navigation', 'clock']) {
    const state = lifecycle();
    state.exports.WhatsAppAttributionProvider({ children: null });
    const cleanup = state.effects[0]();
    if (invalidate === 'expiry') {
      state.now(1_000_000 + attribution.ATTRIBUTION_TTL_MS);
      state.timers.get(1).fn();
    } else if (invalidate === 'navigation') {
      state.window.history.replaceState(null, '', '/?utm_source=organic');
      state.window.history.pushState(null, '', '/' + query);
    } else {
      state.now(999_999);
      state.context().revalidate();
    }
    state.now(1_000_000);
    assert.equal(state.context().revalidate(), false, invalidate);
    cleanup();
  }
});
