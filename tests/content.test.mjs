import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
const posts = JSON.parse(readFileSync('tests/posts.json', 'utf8'));

test('all 47 posts retain their Markdown bodies and flat frontmatter', () => {
  assert.equal(posts.length, 47);
  for (const post of posts) {
    const path = 'src/content/posts/' + post.path;
    assert.ok(existsSync(path), 'Migrated article missing: ' + post.slug);
    const markdown = readFileSync(path, 'utf8');
    const [, frontmatter, body] = markdown.match(/^---\n([\s\S]*?)\n---([\s\S]*)$/);
    assert.ok(markdown.startsWith('---\n'));
    assert.equal(createHash('sha256').update(body).digest('hex'), post.bodySha256, post.slug);
    assert.ok(frontmatter.includes('date: ' + post.date));
    assert.ok(frontmatter.includes('slug: ' + JSON.stringify(post.slug)));
    assert.doesNotMatch(frontmatter, /\[taxonomies\]|\[extra\]|category:/);
  }
  assert.ok(!existsSync('src/content/posts/_index.md'));
});

test('production home lists exactly the 19 published posts newest first', () => {
  assert.ok(existsSync('dist/index.html'), 'Astro must emit the article index');
  const html = readFileSync('dist/index.html', 'utf8');
  const expected = posts.filter(p => !p.draft).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  assert.equal(expected.length, 19);
  assert.equal(posts.filter(p => p.draft).length, 28);
  const links = [...html.matchAll(/href="\/posts\/([^"/]+)\/"/g)].map(m => m[1]);
  assert.deepEqual(links, expected.map(p => p.slug));
  assert.equal([...html.matchAll(/<article class="article">/g)].length, 19);
  for (const post of expected) assert.ok(html.includes(post.date.slice(0, 10)), post.slug);
});
