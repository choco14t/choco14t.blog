import type { Element, Root } from 'hast';

declare module 'hast' {
  interface RootContentMap { raw: { type: 'raw'; value: string } }
  interface ElementContentMap { raw: { type: 'raw'; value: string } }
}

interface Options { fetch?: typeof fetch }

export default function rehypeEmbeds({ fetch: request = globalThis.fetch }: Options = {}) {
  return async (tree: Root) => {
    async function transform(parent: Root | Element): Promise<void> {
      await Promise.all(parent.children.map(async (node, index) => {
        if (node.type !== 'element') return;
        if (node.tagName !== 'p') return transform(node);
        const [link] = node.children;
        if (node.children.length !== 1 || link?.type !== 'element' || link.tagName !== 'a'
          || link.children.length !== 1 || link.children[0]?.type !== 'text'
          || link.children[0].value !== link.properties.href) return;
        let url: URL;
        try { url = new URL(String(link.properties.href)); } catch { return; }
        if (url.protocol !== 'https:' || url.username || url.password || url.port) return;
        if (url.hostname === 'open.spotify.com') {
          const match = url.pathname.match(/^\/(track|album|artist|playlist|episode|show)\/([A-Za-z0-9]{22})$/);
          if (!match) return;
          parent.children[index] = {
            type: 'element', tagName: 'iframe', properties: {
              className: ['spotify-embed'], src: `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
              title: `Spotify ${match[1]}`, loading: 'lazy', width: '100%', height: 352,
              allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
              allowFullScreen: true,
            }, children: [],
          };
          return;
        }
        if (url.hostname !== 'bsky.app'
          || !/^\/profile\/(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+|did:plc:[a-z2-7]+)\/post\/[a-zA-Z0-9]+$/.test(url.pathname)) return;
        const endpoint = new URL('https://embed.bsky.app/oembed');
        endpoint.searchParams.set('url', url.origin + url.pathname);
        try {
          const response = await request(endpoint, { signal: AbortSignal.timeout(2000), redirect: 'error' });
          if (!response.ok) return;
          const data: unknown = await response.json();
          if (!data || typeof data !== 'object' || !('type' in data) || data.type !== 'rich'
            || !('version' in data) || data.version !== '1.0'
            || !('html' in data) || typeof data.html !== 'string'
            || !/<blockquote\b[^>]*class=["']bluesky-embed["']/.test(data.html)
            || !/<script\b[^>]*src=["']https:\/\/embed\.bsky\.app\/static\/embed\.js["']/.test(data.html)) return;
          parent.children[index] = { type: 'raw', value: data.html };
        } catch {
          // Provider/network failures keep the original link, including timeouts and redirects.
        }
      }));
    }
    await transform(tree);
  };
}
