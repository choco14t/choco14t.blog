import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { posts } from './posts.ts';

test('production emits exactly the published post routes', () => {
  assert.ok(existsSync('dist/posts'), 'Astro must emit post routes');
  const actual = readdirSync('dist/posts', { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(`dist/posts/${entry.name}/index.html`))
    .map(entry => entry.name)
    .sort();
  const published = posts.filter(post => !post.draft).map(post => post.slug).sort();
  assert.deepEqual(actual, published);
  for (const post of posts.filter(post => post.draft)) {
    assert.ok(!existsSync(`dist/posts/${post.slug}/index.html`), post.slug);
  }
});

test('published articles render their content, co-located images, and Dayfox/Nightfox-highlighted code', () => {
  const imagePost = readFileSync('dist/posts/2023-03/index.html', 'utf8');
  assert.match(imagePost, /<h1 class="post-title">近況 2023年3月<\/h1>/);
  assert.match(imagePost, /<section class="post-content">/);
  const imageSources = [...imagePost.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert.equal(imageSources.length, 6);
  for (const source of imageSources) {
    assert.ok(existsSync(`dist${new URL(source, 'https://blog.choco14t.net').pathname}`), source);
  }

  const codePost = readFileSync('dist/posts/agentic-coding-202602/index.html', 'utf8');
  assert.match(codePost, /<pre class="astro-code[^"]*dayfox[^"]*nightfox/);
  assert.match(codePost, /--shiki-dark-bg:#192330/);
  assert.match(codePost, /background-color:#f6f2ee/);
});

test('post images retain their aspect ratio when constrained to the content width', () => {
  const post = readFileSync('dist/posts/todays-ice/index.html', 'utf8');
  const stylesheet = post.match(/href="([^" ]+\.css)"/);
  assert.ok(stylesheet, 'Post must load compiled styles');
  const css = readFileSync(`dist${stylesheet[1]}`, 'utf8');
  assert.match(css, /\.post-content img\{[^}]*max-width:100%;[^}]*height:auto/);
});

test('every local image reference resolves, including raw HTML images', () => {
  for (const post of posts) {
    const markdown = readFileSync(`src/content/posts/${post.path}`, 'utf8');
    const markdownImages = [...markdown.matchAll(/!\[[^\]]*\]\((?!https?:|\/)([^)\s]+)/g)].map(match => match[1]);
    const htmlImages = [...markdown.matchAll(/<img[^>]+src="((?!https?:|\/)[^"]+)"/g)].map(match => match[1]);
    const localImages = [...markdownImages, ...htmlImages];

    if (!post.draft) {
      const html = readFileSync(`dist/posts/${post.slug}/index.html`, 'utf8');
      const emitted = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
      assert.equal(emitted.length, localImages.length, post.slug);
      for (const source of emitted) {
        const url = new URL(source, `https://blog.choco14t.net/posts/${post.slug}/`);
        assert.ok(existsSync(`dist${url.pathname}`), `${post.slug}: ${source}`);
      }
    }

    for (const source of htmlImages) {
      assert.ok(existsSync(`public/posts/${post.slug}/${source.replace(/^\.\//, '')}`), `${post.slug}: ${source}`);
    }
  }
});

test('the dev server exposes draft post routes', { timeout: 30_000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--ignore-lock', '--host', '127.0.0.1', '--port', '43219'], {
    env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });

  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        response = await fetch('http://127.0.0.1:43219/posts/2019-02-19/');
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.ok(response, `Astro dev server did not start:\n${output}`);
    assert.equal(response.status, 200, output);
    assert.match(await response.text(), /<h1 class="post-title">2019-02-19<\/h1>/);
    const singleHeading = await (await fetch('http://127.0.0.1:43219/posts/display-timestamp-in-terminal/')).text();
    assert.equal([...singleHeading.matchAll(/<h[23]\b/g)].length, 1);
    assert.doesNotMatch(singleHeading, /class="toc-(desktop|mobile)"/);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise(resolve => server.once('exit', resolve)),
      new Promise(resolve => setTimeout(resolve, 2_000)),
    ]);
  }
});


test('article TOCs link every h2/h3 in order and disappear below two headings', () => {
  for (const post of posts.filter(post => !post.draft)) {
    const html = readFileSync(`dist/posts/${post.slug}/index.html`, 'utf8');
    const headings = [...html.matchAll(/<h([23]) id="([^"]+)"/g)].map(m => ({ depth: +m[1], id: m[2] }));
    if (headings.length < 2) {
      assert.doesNotMatch(html, /class="toc-(desktop|mobile)"/, post.slug);
      continue;
    }
    const desktop = html.match(/<nav class="toc-desktop"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    const mobile = html.match(/<details class="toc-mobile"[^>]*>([\s\S]*?)<\/details>/)?.[1];
    assert.ok(desktop, post.slug);
    assert.ok(mobile, post.slug);
    assert.doesNotMatch(html.match(/<details class="toc-mobile"[^>]*>/)![0], /\bopen\b/);
    assert.ok(html.indexOf('<details class="toc-mobile"') < html.indexOf('<section class="post-content"'));
    for (const toc of [desktop, mobile]) {
      assert.deepEqual([...toc.matchAll(/href="#([^"]+)"/g)].map(m => m[1]), headings.map(h => h.id), post.slug);
      const list = toc.slice(toc.indexOf('<ol>'));
      let level = 0;
      const depths: number[] = [];
      for (const token of list.matchAll(/<ol>|<\/ol>|<a /g)) {
        if (token[0] === '<ol>') level++;
        else if (token[0] === '</ol>') level--;
        else depths.push(level);
      }
      let hasParent = false;
      assert.deepEqual(depths, headings.map(h => {
        if (h.depth === 2) { hasParent = true; return 1; }
        return hasParent ? 2 : 1;
      }), post.slug);
    }
  }
});
