import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../astro.config.ts';

const spotifyId = '4uLU6hMCjMI75M1A2tKUQC';
const bsky = 'https://bsky.app/profile/bsky.app/post/3jt5c7j2xl22y';
const officialHtml = '<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:example/app.bsky.feed.post/3jt5c7j2xl22y"><p>Official post</p></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>';
const render = async (markdown: string) => (await (await config.markdown!.processor!.createRenderer({ syntaxHighlight: false })).render(markdown)).code;

for (const entity of ['track', 'album', 'artist', 'playlist', 'episode', 'show']) {
  test(`standalone Spotify ${entity} uses official lazy iframe without fetching`, async t => {
    const request = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not fetch'); });
    const code = await render(`https://open.spotify.com/${entity}/${spotifyId}?si=tracking`);
    assert.match(code, new RegExp(`<iframe[^>]*src="https://open.spotify.com/embed/${entity}/${spotifyId}"`));
    assert.match(code, /loading="lazy"/);
    assert.match(code, /title="Spotify/);
    assert.doesNotMatch(code, /tracking/);
    assert.equal(request.mock.callCount(), 0);
  });
}

test('unsupported hosts, unsafe IDs, and prose remain links and are never fetched', async t => {
  const request = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not fetch'); });
  for (const url of [
    `https://open.spotify.com/user/${spotifyId}`, `https://open.spotify.com/track/not-an-id`,
    `https://open.spotify.com.evil.test/track/${spotifyId}`, `https://user@open.spotify.com/track/${spotifyId}`,
    `http://open.spotify.com/track/${spotifyId}`, `https://open.spotify.com:444/track/${spotifyId}`,
    'https://bsky.app.evil.test/profile/a/post/b', 'https://bsky.app/profile/bsky.app',
    'https://evil.test/post', `Listen to https://open.spotify.com/track/${spotifyId}`, `Read ${bsky}`,
  ]) {
    const code = await render(url);
    assert.doesNotMatch(code, /<iframe|bluesky-embed/);
    assert.match(code, /<a /);
  }
  assert.equal(request.mock.callCount(), 0);
});

test('standalone Bluesky URL resolves through the fixed endpoint with bounded fetch', async t => {
  const request = t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, options?: RequestInit) => {
    const endpoint = new URL(String(input));
    assert.equal(endpoint.origin + endpoint.pathname, 'https://embed.bsky.app/oembed');
    assert.equal(endpoint.searchParams.get('url'), bsky);
    assert.equal(options?.redirect, 'error');
    assert.ok(options?.signal);
    return Response.json({ type: 'rich', version: '1.0', html: officialHtml });
  });
  const code = await render(bsky);
  assert.match(code, /<blockquote class="bluesky-embed"/);
  assert.match(code, /src="https:\/\/embed.bsky.app\/static\/embed.js"/);
  assert.equal(request.mock.callCount(), 1);
});

for (const failure of ['http', 'json', 'shape', 'empty', 'unrecognized-html', 'throw', 'timeout']) {
  test(`Bluesky ${failure} response degrades to original link`, { timeout: 5000 }, async t => {
    const request = t.mock.method(globalThis, 'fetch', async (_input: unknown, options?: RequestInit) => {
      if (failure === 'http') return new Response('no', { status: 503 });
      if (failure === 'json') return new Response('{');
      if (failure === 'shape') return Response.json({ type: 'photo', html: officialHtml });
      if (failure === 'empty') return Response.json({ type: 'rich', version: '1.0', html: '' });
      if (failure === 'unrecognized-html') return Response.json({ type: 'rich', version: '1.0', html: '<p>oops</p>' });
      if (failure === 'throw') throw new Error('network');
      return await new Promise<Response>((_, reject) => {
        const keepAlive = setTimeout(() => reject(new Error('timeout missing')), 4000);
        options?.signal?.addEventListener('abort', () => { clearTimeout(keepAlive); reject(options.signal?.reason); }, { once: true });
      });
    });
    const code = await render(bsky);
    assert.match(code, new RegExp(`<a href="${bsky}">${bsky}</a>`));
    assert.doesNotMatch(code, /bluesky-embed/);
    assert.equal(request.mock.callCount(), 1);
  });
}
