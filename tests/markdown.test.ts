import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('article tables retain their structure and have themed borders and padded cells', () => {
  const html = readFileSync('dist/posts/implement-field-permissions-with-field-middleware/index.html', 'utf8');
  assert.match(html, /<table>[\s\S]*<th>フレームワーク<\/th>[\s\S]*<td>Express<\/td>[\s\S]*<td>Fastify<\/td>[\s\S]*<\/table>/);
  const stylesheet = html.match(/href="([^" ]+\.css)"/);
  assert.ok(stylesheet);
  const css = readFileSync(`dist${stylesheet[1]}`, 'utf8');
  const table = css.match(/\.post-content table\{([^}]+)\}/)?.[1] ?? '';
  assert.match(table, /border-collapse:collapse/);
  assert.match(table, /width:100%/);
  assert.match(table, /overflow-wrap:anywhere/);
  const cells = css.match(/\.post-content th,\.post-content td\{([^}]+)\}/)?.[1] ?? '';
  assert.match(cells, /border:1px solid var\(--color-border\)/);
  assert.match(cells, /padding:\.5rem \.75rem/);
  assert.match(css, /\.post-content th\{[^}]*background:var\(--color-raised\)/);
});

test('single paragraph line endings become breaks while fenced code preserves newlines', () => {
  const prose = readFileSync('dist/posts/recovering-too-many-records/index.html', 'utf8');
  assert.match(prose, /レコードが作成されてしまっていた。<br\s*\/?>\n?作成されてしまった/);
  const code = readFileSync('dist/posts/agentic-coding-202602/index.html', 'utf8').match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)?.[1];
  assert.ok(code);
  assert.match(code, /\n/);
  assert.doesNotMatch(code, /<br\b/);
});
