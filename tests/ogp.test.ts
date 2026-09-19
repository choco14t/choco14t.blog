import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function metadata(html: string, key: string) {
  return [...html.matchAll(/<meta\b[^>]*>/g)]
    .filter(([tag]) => tag.includes(`property="${key}"`) || tag.includes(`name="${key}"`))
    .map(([tag]) => tag.match(/content="([^"]*)"/)?.[1]);
}

function png(path: string) {
  const bytes = readFileSync(path);
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
}

test('home exposes one complete website card without descriptions', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const expected = {
    'og:title': 'blog.choco14t.net',
    'og:type': 'website',
    'og:url': 'https://blog.choco14t.net/',
    'og:image': 'https://blog.choco14t.net/og/default.png',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': 'blog.choco14t.net',
    'twitter:card': 'summary_large_image',
    'twitter:title': 'blog.choco14t.net',
    'twitter:image': 'https://blog.choco14t.net/og/default.png',
    'twitter:image:alt': 'blog.choco14t.net',
  };
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(metadata(html, key), [value], key);
  for (const key of ['og:description', 'twitter:description']) assert.deepEqual(metadata(html, key), []);
});

test('the shared image is a 1200 by 630 PNG file', () => png('dist/og/default.png'));

test('404 has no social card metadata', () => {
  assert.doesNotMatch(readFileSync('dist/404.html', 'utf8'), /<meta\b[^>]*(?:og:|twitter:)/);
});
