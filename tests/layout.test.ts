import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

test('404 preserves the Japanese site shell, favicon, and Nord styling without GA', () => {
  assert.ok(existsSync('dist/404.html'), 'Astro must emit the custom 404 page');
  const html = readFileSync('dist/404.html', 'utf8');
  for (const expected of ['lang="ja"', 'Not Found | blog.choco14t.net', 'ページが見つかりませんでした', 'class="header"', 'class="brand"', 'class="container"', 'class="content"', 'class="footer"', 'choco All rights reserved.', '/icon.png']) assert.ok(html.includes(expected), expected);
  assert.doesNotMatch(html, /googletagmanager|gtag\(|footer-ga|Google Analytics/);
  assert.ok(existsSync('public/icon.png'));
  const stylesheet = html.match(/href="([^" ]+\.css)"/);
  assert.ok(stylesheet, 'Layout must load compiled SCSS');
  const css = readFileSync(`dist${stylesheet[1]}`, 'utf8');
  assert.match(css, /#2e3440/i);
  assert.match(css, /max-width:800px/);
});
