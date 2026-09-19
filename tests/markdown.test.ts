import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('single paragraph line endings become breaks while fenced code preserves newlines', () => {
  const prose = readFileSync('dist/posts/recovering-too-many-records/index.html', 'utf8');
  assert.match(prose, /レコードが作成されてしまっていた。<br\s*\/?>\n?作成されてしまった/);
  const code = readFileSync('dist/posts/agentic-coding-202602/index.html', 'utf8').match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)?.[1];
  assert.ok(code);
  assert.match(code, /\n/);
  assert.doesNotMatch(code, /<br\b/);
});
