import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

test('404 preserves the Japanese site shell, favicon, and theme styling without GA', () => {
  assert.ok(existsSync('dist/404.html'), 'Astro must emit the custom 404 page');
  const html = readFileSync('dist/404.html', 'utf8');
  for (const expected of ['lang="ja"', 'Not Found | blog.choco14t.net', 'ページが見つかりませんでした', 'class="header"', 'class="brand"', 'class="container"', 'class="content"', 'class="footer"', 'choco All rights reserved.', '/icon.png']) assert.ok(html.includes(expected), expected);
  assert.doesNotMatch(html, /googletagmanager|gtag\(|footer-ga|Google Analytics/);
  assert.ok(existsSync('public/icon.png'));
  const stylesheet = html.match(/href="([^" ]+\.css)"/);
  assert.ok(stylesheet, 'Layout must load compiled SCSS');
  const css = readFileSync(`dist${stylesheet[1]}`, 'utf8');
  assert.match(css, /--color-background:#f6f2ee/i);
  assert.match(css, /--color-background:#192330/i);
  assert.match(css, /max-width:800px/);
});


test('theme preference initializes before styles and control offers accessible native choices', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<label[^>]*for="theme-select"[^>]*>Theme<\/label>/);
  assert.match(html, /<select[^>]*id="theme-select"/);
  for (const [value, label] of [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']]) {
    assert.match(html, new RegExp(`<option value="${value}"[^>]*>${label}</option>`));
  }
  assert.match(html, /data-theme-icon="light"/);
  assert.match(html, /data-theme-icon="dark"/);
  const initializer = html.indexOf('localStorage.getItem');
  assert.ok(initializer > 0 && initializer < html.indexOf('rel="stylesheet"'));
  assert.match(html.slice(0, html.indexOf('</head>')), /try[\s\S]*catch/);
});

test('Dayfox and Nightfox primary text contrast meets WCAG AA', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const css = readFileSync(`dist${html.match(/href="([^" ]+\.css)"/)![1]}`, 'utf8');
  const backgrounds = [...css.matchAll(/--color-background:(#[0-9a-f]{6})/gi)].map(m => m[1]);
  const foregrounds = [...css.matchAll(/--color-text:(#[0-9a-f]{6})/gi)].map(m => m[1]);
  assert.ok(backgrounds.length >= 2 && backgrounds.length === foregrounds.length);
  const luminance = (hex: string) => hex.slice(1).match(/../g)!.map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
  backgrounds.forEach((background, i) => {
    const values = [luminance(background), luminance(foregrounds[i])].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `${foregrounds[i]} on ${background}`);
  });
  const codeTitle = css.match(/\.code-title\{([^}]+)/)![1];
  const titleForeground = codeTitle.match(/(?:^|;)color:var\((--[^)]+)\)/)![1];
  const titleBackground = codeTitle.match(/(?:^|;)background:var\((--[^)]+)\)/)![1];
  for (const block of css.matchAll(/--color-background:#[0-9a-f]{6};[^}]+/gi)) {
    const tokens = Object.fromEntries([...block[0].matchAll(/(--[\w-]+):(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2]]));
    const values = [luminance(tokens[titleForeground]), luminance(tokens[titleBackground])].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `Code title: ${tokens[titleForeground]} on ${tokens[titleBackground]}`);
  }
  assert.match(css, /prefers-color-scheme:dark/);
  assert.match(css, /data-theme=dark/);
  assert.match(css, /--shiki-dark/);
});
