import assert from 'node:assert/strict';
import { readFileSync, existsSync, globSync } from 'node:fs';
import test from 'node:test';
import { posts } from './posts.ts';

test('all posts retain their original frontmatter', () => {
  assert.deepEqual(posts.map(post => post.path).sort(), globSync('**/*.md', { cwd: 'src/content/posts' }).sort());
  for (const post of posts) {
    const path = 'src/content/posts/' + post.path;
    assert.ok(existsSync(path), 'Migrated article missing: ' + post.slug);
    const markdown = readFileSync(path, 'utf8');
    const match = markdown.match(/^(---|\+\+\+)\n([\s\S]*?)\n\1([\s\S]*)$/);
    assert.ok(match);
    const [, delimiter, frontmatter] = match;
    if (delimiter === '---') {
      assert.ok(frontmatter.includes('date: ' + post.date));
      assert.ok(frontmatter.includes('slug: ' + JSON.stringify(post.slug)));
      assert.doesNotMatch(frontmatter, /\[taxonomies\]|\[extra\]|category:/);
    } else {
      assert.ok(frontmatter.includes('date = ' + post.date));
      assert.ok(frontmatter.includes('slug = ' + JSON.stringify(post.slug)));
    }
  }
  assert.ok(!existsSync('src/content/posts/_index.md'));
});

test('production home lists exactly the published posts newest first', () => {
  assert.ok(existsSync('dist/index.html'), 'Astro must emit the article index');
  const html = readFileSync('dist/index.html', 'utf8');
  const expected = posts.filter(p => !p.draft).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const links = [...html.matchAll(/href="\/posts\/([^"/]+)\/"/g)].map(m => m[1]);
  assert.deepEqual(links, expected.map(p => p.slug));
  assert.equal([...html.matchAll(/<article class="article">/g)].length, expected.length);
  for (const post of expected) assert.ok(html.includes(post.date.slice(0, 10)), post.slug);
});
