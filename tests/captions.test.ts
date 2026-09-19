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

for (const [name, markdown, opening, closing] of [
  ['linked', '[![Fox](https://example.com/fox.jpg "At noon")](https://example.com)', '<a href="https://example.com">', '</a>'],
  ['emphasized', '*![Fox](https://example.com/fox.jpg "At noon")*', '<em>', '</em>'],
]) {
  test(`${name} titled images keep their wrapper with a direct semantic caption`, async () => {
    const { code } = await renderer.render(markdown);
    assert.equal(code, `<figure>${opening}<img src="https://example.com/fox.jpg" alt="Fox">${closing}<figcaption>At noon</figcaption></figure>`);
  });
}

test('nested inline wrappers preserve surrounding prose when a caption splits the paragraph', async () => {
  const { code } = await renderer.render('Before *lead [![Fox](https://example.com/fox.jpg "At noon")](https://example.com) tail* after');
  assert.equal(code, '<p>Before <em>lead </em></p><figure><em><a href="https://example.com"><img src="https://example.com/fox.jpg" alt="Fox"></a></em><figcaption>At noon</figcaption></figure><p><em> tail</em> after</p>');
});
