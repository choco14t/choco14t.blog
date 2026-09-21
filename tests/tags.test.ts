import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
const posts = globSync('src/content/posts/**/*.md').map(path => {
  const markdown = readFileSync(path, 'utf8');
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/)![1];
  const field = (name: string) => frontmatter.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1];
  return {
    slug: JSON.parse(field('slug')!) as string,
    draft: field('draft') === 'true',
    date: field('date')!,
    tags: JSON.parse(field('tags')!) as string[],
  };
});
const published = posts.filter(post => !post.draft);
const tags = [...new Set(published.flatMap(post => post.tags))].sort();

test('the tag index lists every public tag with encoded links and no draft-only tags', () => {
  assert.ok(existsSync('dist/tags/index.html'), 'Astro must emit the tag index');
  const html = readFileSync('dist/tags/index.html', 'utf8');
  const links = [...html.matchAll(/<li><a href="\/tags\/([^"]+)\/">([^<]+)<\/a><\/li>/g)]
    .map(([, href, name]) => ({ href, name }));
  assert.deepEqual(links, tags.map(name => ({ href: encodeURIComponent(name), name })));
  assert.ok(html.includes('/tags/claude%20code/'));
  assert.ok(html.includes('/tags/node.js/'));
  assert.ok(!html.includes('React Native'));
});

test('each public tag page lists only matching published posts with dates and tag badges', () => {
  const directories = readdirSync('dist/tags', { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  assert.deepEqual(directories, tags);

  for (const tag of tags) {
    const html = readFileSync(`dist/tags/${tag}/index.html`, 'utf8');
    const expected = published
      .filter(post => post.tags.includes(tag))
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const links = [...html.matchAll(/class="article-title"><a href="\/posts\/([^/]+)\/"/g)]
      .map(([, slug]) => slug);
    assert.deepEqual(links, expected.map(post => post.slug), tag);
    assert.equal([...html.matchAll(/<article class="article">/g)].length, expected.length, tag);
    for (const post of expected) {
      assert.ok(html.includes(post.date.slice(0, 10)), `${tag}: ${post.slug}`);
      for (const badge of post.tags) {
        assert.ok(html.includes(`<span class="tag"><a href="/tags/${encodeURIComponent(badge)}/">${badge}</a></span>`), `${tag}: ${badge}`);
      }
    }
  }

  assert.ok(!existsSync('dist/tags/React Native/index.html'));
});
