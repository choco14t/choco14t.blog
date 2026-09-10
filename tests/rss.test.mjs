import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const posts = JSON.parse(readFileSync('tests/posts.json', 'utf8'));

test('RSS contains exactly the 19 published posts newest first with preserved URLs and dates', () => {
  assert.ok(existsSync('dist/rss.xml'), 'Astro must emit /rss.xml');
  const xml = readFileSync('dist/rss.xml', 'utf8');
  assert.match(xml, /<language>ja<\/language>/);

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    link: item.match(/<link>([^<]+)<\/link>/)?.[1],
    date: item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1],
  }));
  const expected = posts
    .filter(post => !post.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  assert.equal(items.length, 19);
  assert.deepEqual(
    items.map(item => item.link),
    expected.map(post => `https://blog.choco14t.net/posts/${post.slug}/`),
  );
  assert.deepEqual(
    items.map(item => Date.parse(item.date)),
    expected.map(post => Date.parse(post.date)),
  );
  for (const post of posts.filter(post => post.draft)) {
    assert.ok(!xml.includes(`/posts/${post.slug}/`), post.slug);
  }
});
