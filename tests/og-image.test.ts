import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { renderOgImage } from '../src/og/render.ts';

const titles = globSync('src/content/posts/**/*.md').map(path => {
  const markdown = readFileSync(path, 'utf8');
  return JSON.parse(markdown.match(/^title(?::| =) (.+)$/m)![1]) as string;
});

test('renderer supports current titles, mixed scripts, punctuation, and longer wrapped titles', async () => {
  const fixtures = [...titles, 'blog.choco14t.net', '短い題名', '日本語と TypeScript 6 / Node.js 24 — 「引用」 & <tags>', '長い日本語のタイトルを最後まで読みやすく折り返して表示するための検証です。'.repeat(3)];
  for (const title of fixtures) {
    const bytes = Buffer.from(await renderOgImage(title));
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), title);
    assert.equal(bytes.readUInt32BE(16), 1200, title);
    assert.equal(bytes.readUInt32BE(20), 630, title);
  }
  assert.notDeepEqual(await renderOgImage('日本語'), await renderOgImage('TypeScript'));
});

test('a title that cannot fit legibly fails with a title-specific diagnostic instead of clipping', async () => {
  const title = '限界を超える長いタイトル'.repeat(80);
  await assert.rejects(renderOgImage(title), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /OG image title.*cannot fit.*32px/);
    assert.ok(error.message.includes(title));
    return true;
  });
});
