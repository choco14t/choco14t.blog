import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync('dist/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(([, attributes, source]) => {
  const path = attributes.match(/src="([^"]+)"/)?.[1];
  return path ? readFileSync(`dist${path}`, 'utf8') : source;
});

function page(saved: string | null = null, blocked = false) {
  const root = { dataset: {} as Record<string, string> };
  const attributes = new Map<string, string>();
  let focused = false;
  let hidden = false;
  const toggle = Object.assign(new EventTarget(), {
    disabled: true,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    focus: () => { focused = true; },
    getBoundingClientRect: () => ({ bottom: 48, right: 359 }),
  });
  const choices = ['system', 'light', 'dark'].map(value => Object.assign(new EventTarget(), {
    value, textContent: value[0].toUpperCase() + value.slice(1), autofocus: false,
    attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
  }));
  const menu = Object.assign(new EventTarget(), {
    style: { top: '', right: '' },
    querySelectorAll: () => choices,
    hidePopover: () => { hidden = true; },
  });
  const system = Object.assign(new EventTarget(), { matches: true });
  const storage = {
    getItem() { if (blocked) throw new Error('blocked'); return saved; },
    setItem(_key: string, value: string) { if (blocked) throw new Error('blocked'); saved = value; },
    removeItem() { if (blocked) throw new Error('blocked'); saved = null; },
  };
  const legacySelect = Object.assign(new EventTarget(), { value: 'system', disabled: true });
  const document = {
    documentElement: root,
    querySelector: (selector: string) => selector === '#theme-toggle' ? toggle : selector === '#theme-menu' ? menu : legacySelect,
    querySelectorAll: () => choices,
  };
  const window = Object.assign(new EventTarget(), { innerWidth: 375 });
  for (const script of scripts) runInNewContext(`(() => { ${script} })()`, { document, window, localStorage: storage, matchMedia: () => system });
  return {
    root, toggle, menu, choices,
    label: () => attributes.get('aria-label'),
    saved: () => saved,
    choose(value: string) { choices.find(choice => choice.value === value)!.dispatchEvent(new Event('click')); },
    selected: () => choices.filter(choice => choice.attributes.get('aria-pressed') === 'true').map(choice => choice.value),
    focused: () => focused, hidden: () => hidden,
    systemChange() { system.matches = !system.matches; system.dispatchEvent(new Event('change')); },
  };
}

test('theme menu starts in System with a mode name even when the system is dark', () => {
  const view = page();
  assert.equal(view.label(), 'Theme: System');
  assert.equal(view.toggle.disabled, false);
  assert.deepEqual(view.selected(), ['system']);
  view.systemChange();
  assert.equal(view.label(), 'Theme: System');
  assert.equal(view.root.dataset.theme, undefined);
});

test('menu selections persist, update the named mode and selected state, close, and restore focus', () => {
  const view = page('dark');
  assert.equal(view.root.dataset.theme, 'dark');
  assert.equal(view.label(), 'Theme: Dark');
  assert.deepEqual(view.selected(), ['dark']);
  for (const mode of ['light', 'dark', 'system']) {
    view.choose(mode);
    assert.equal(view.label(), `Theme: ${mode[0].toUpperCase() + mode.slice(1)}`);
    assert.deepEqual(view.selected(), [mode]);
    assert.equal(view.root.dataset.theme, mode === 'system' ? undefined : mode);
    assert.equal(view.saved(), mode === 'system' ? null : mode);
    assert.equal(view.hidden(), true);
    assert.equal(view.focused(), true);
  }
});

test('invalid or blocked storage falls back to System without blocking manual selection', () => {
  for (const view of [page('invalid'), page('dark', true)]) {
    assert.equal(view.label(), 'Theme: System');
    assert.deepEqual(view.selected(), ['system']);
    view.choose('light');
    assert.equal(view.root.dataset.theme, 'light');
    assert.equal(view.label(), 'Theme: Light');
  }
});
