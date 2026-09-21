import assert from 'node:assert/strict';
import { readFileSync, globSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import { posts } from './posts.ts';

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

function card(html: string, title: string, type: string, path: string, image: string, alt: string) {
  const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const expected = {
    'og:title': escape(title), 'og:type': type, 'og:url': new URL(path, 'https://blog.choco14t.net').href,
    'og:image': `https://blog.choco14t.net${image}`, 'og:image:width': '1200', 'og:image:height': '630',
    'og:image:type': 'image/png', 'og:image:alt': escape(alt), 'twitter:card': 'summary_large_image',
    'twitter:title': escape(title), 'twitter:image': `https://blog.choco14t.net${image}`, 'twitter:image:alt': escape(alt),
  };
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(metadata(html, key), [value], `${path}: ${key}`);
  for (const key of ['og:description', 'twitter:description']) assert.deepEqual(metadata(html, key), [], path);
}

test('all published articles have title-only article cards and exactly their PNG files', () => {
  const published = posts.filter(post => !post.draft);
  assert.ok(published.length > 0);
  for (const post of published) {
    const path = `/posts/${post.slug}/`;
    const image = `/og/posts/${post.slug}.png`;
    const html = readFileSync(`dist${path}index.html`, 'utf8');
    card(html, post.title, 'article', path, image, post.title);
    png(`dist${image}`);
  }
  assert.deepEqual(globSync('dist/og/posts/**/*.png').sort(), published.map(post => `dist/og/posts/${post.slug}.png`).sort());
  for (const post of posts.filter(post => post.draft)) {
    assert.ok(!existsSync(`dist/posts/${post.slug}/index.html`));
    assert.ok(!existsSync(`dist/og/posts/${post.slug}.png`));
  }
});

test('tag index and every tag page use canonical website cards and the one shared image', () => {
  const pages = globSync('dist/tags/**/index.html');
  assert.ok(pages.includes('dist/tags/claude code/index.html'), 'space-containing tag exercises URL encoding');
  for (const path of pages) {
    const html = readFileSync(path, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)![1];
    const url = '/' + path.slice(5, -10).split('/').map(encodeURIComponent).join('/');
    card(html, title, 'website', url, '/og/default.png', 'blog.choco14t.net');
  }
  assert.deepEqual(globSync('dist/og/*.png'), ['dist/og/default.png']);
});

test('development exposes a draft article card and PNG without query strings in canonical URLs', { timeout: 30_000 }, async () => {
  const post = posts.find(post => post.draft)!;
  const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--ignore-lock', '--host', '127.0.0.1', '--port', '43220'], {
    env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(server, 'exit');
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { response = await fetch(`http://127.0.0.1:43220/posts/${post.slug}/?share=1`); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.ok(response, output);
    assert.equal(response.status, 200, output);
    card(await response.text(), post.title, 'article', `/posts/${post.slug}/`, `/og/posts/${post.slug}.png`, post.title);
    const image = await fetch(`http://127.0.0.1:43220/og/posts/${post.slug}.png`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type')!, /^image\/png/);
    const bytes = Buffer.from(await image.arrayBuffer());
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
  } finally {
    server.kill('SIGTERM');
    const timer = setTimeout(() => server.kill('SIGKILL'), 2000);
    await exited;
    clearTimeout(timer);
  }
});
