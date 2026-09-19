import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../astro.config.ts';

const renderer = await config.markdown!.processor!.createRenderer({ syntaxHighlight: false });

test('image titles become semantic captions while alt remains descriptive', async () => {
  const { code } = await renderer.render('![A sleeping fox](https://example.com/fox.jpg "At noon")');
  assert.match(code, /^<figure><img[^>]*alt="A sleeping fox"[^>]*><figcaption>At noon<\/figcaption><\/figure>$/);
  assert.doesNotMatch(code, /title=|<p>/);
});

test('untitled images retain their paragraph and alt without a figure', async () => {
  const { code } = await renderer.render('![A fox](https://example.com/fox.jpg)');
  assert.match(code, /^<p><img[^>]*alt="A fox"[^>]*><\/p>$/);
  assert.doesNotMatch(code, /figure/);
});

test('caption text is escaped and mixed paragraph text remains in order', async () => {
  const { code } = await renderer.render('Before ![Fox](https://example.com/fox.jpg "<script>alert(1)</script>") after');
  assert.match(code, /<p>Before <\/p><figure>/);
  assert.match(code, /<figcaption>&#x3C;script>alert\(1\)&#x3C;\/script><\/figcaption><\/figure><p> after<\/p>/);
  assert.doesNotMatch(code, /<script>/);
});
