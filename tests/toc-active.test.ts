import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync('dist/posts/implement-field-permissions-with-field-middleware/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(([, attributes]) => attributes.includes('type="module"'))
  .map(([, attributes, source]) => {
    const path = attributes.match(/src="([^"]+)"/)?.[1];
    return path ? readFileSync(`dist${path}`, 'utf8') : source;
  });

function page(scrollY = 0, hash = '') {
  const window = new EventTarget();
  const document = new EventTarget();
  const state = { scrollY, innerHeight: 800 };
  const location = { hash };
  const root = { dataset: {}, scrollHeight: 3500, clientHeight: 800 };
  const positions = [200, 600, 2500, 3380];
  const headings = positions.map((top, i) => ({ id: `section-${i}`, getBoundingClientRect: () => ({ top: top - state.scrollY }) }));
  const links = ['desktop', 'mobile'].flatMap(mode => headings.map(heading => {
    const attributes = new Map([['href', `#${heading.id}`]]);
    return {
      mode, hash: `#${heading.id}`,
      getAttribute: (name: string) => attributes.get(name) ?? null,
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      removeAttribute: (name: string) => attributes.delete(name),
    };
  }));
  const select = Object.assign(new EventTarget(), { value: 'system', disabled: true });
  const frames: FrameRequestCallback[] = [];
  Object.assign(document, {
    documentElement: root,
    querySelector: (selector: string) => selector === '#theme-select' ? select : null,
    querySelectorAll: (selector: string) => selector.includes('.post-content') ? headings : selector.includes('.toc-') ? links : [],
    getElementById: (id: string) => headings.find(heading => heading.id === id) ?? null,
  });
  Object.defineProperties(window, {
    scrollY: { get: () => state.scrollY }, innerHeight: { get: () => state.innerHeight },
  });
  Object.assign(window, { document, location });
  const context = {
    window, document, location,
    requestAnimationFrame: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; },
    matchMedia: () => Object.assign(new EventTarget(), { matches: false }),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  for (const script of scripts) runInNewContext(`(() => { ${script} })()`, context);
  const flush = () => { for (const callback of frames.splice(0)) callback(0); };
  flush();
  return {
    scroll(y: number, event = 'scroll') {
      state.scrollY = y;
      window.dispatchEvent(new Event(event));
      document.dispatchEvent(new Event(event));
      flush();
    },
    hash(value: string, y: number) { location.hash = value; this.scroll(y, 'hashchange'); },
    current() {
      return ['desktop', 'mobile'].map(mode => links.filter(link => link.mode === mode && link.getAttribute('aria-current') === 'location').map(link => link.hash));
    },
  };
}

function current(view: ReturnType<typeof page>, id?: number) {
  const expected = id === undefined ? [] : [`#section-${id}`];
  assert.deepEqual(view.current(), [expected, expected]);
}

test('active TOC follows section boundaries, long prose, fast jumps, and reverse scrolling', () => {
  const view = page();
  current(view);
  view.scroll(103); current(view);
  view.scroll(104); current(view, 0);
  view.scroll(550); current(view, 1);
  view.scroll(1600); current(view, 1);
  view.scroll(2450); current(view, 2);
  view.scroll(350); current(view, 0);
  view.scroll(0); current(view);
});

test('direct hashes and native hash navigation select the matching section in both TOCs', () => {
  const view = page(2484, '#section-2');
  current(view, 2);
  view.hash('#section-1', 584); current(view, 1);
  view.hash('#section-0', 184); current(view, 0);
});

test('the page bottom selects the final heading even when it cannot reach the top', () => {
  const view = page();
  view.scroll(2700); current(view, 3);
  view.scroll(2600); current(view, 2);
  view.scroll(550, 'resize'); current(view, 1);
});

test('active TOC text is bold, inactive text muted, and unnumbered hierarchy stays indented', () => {
  const css = readFileSync(`dist${html.match(/href="([^" ]+\.css)"/)![1]}`, 'utf8');
  const rule = css.match(/[^{}]*\[aria-current=location\][^{}]*\{([^}]+)\}/)?.[1];
  assert.ok(rule, 'Active TOC styling must be emitted');
  assert.match(rule, /font-weight:(?:bold|700)/);
  assert.doesNotMatch(rule, /background|border/);
  const links = css.match(/\.toc-desktop a,\.toc-mobile a\{([^}]+)\}/)?.[1];
  assert.ok(links);
  assert.match(links, /(?:^|;)color:var\(--color-muted\)/);
  const lists = css.match(/\.toc-desktop ol,\.toc-mobile ol\{([^}]+)\}/)?.[1];
  assert.ok(lists);
  assert.match(lists, /list-style(?:-type)?:none/);
  assert.ok(parseFloat(lists.match(/padding-left:([^;]+)/)?.[1] ?? '0') > 0);
  assert.match(rule, /(?:^|;)color:var\(--color-text\)/);
});
