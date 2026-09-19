import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';
import rehypeImageCaptions from './src/markdown/rehype-image-captions.ts';
import rehypeEmbeds from './src/markdown/rehype-embeds.ts';
import dayfox from './src/themes/dayfox.json' with { type: 'json' };
import nightfox from './src/themes/nightfox.json' with { type: 'json' };

export default defineConfig({
  site: 'https://blog.choco14t.net',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  markdown: { processor: unified({ remarkPlugins: [remarkBreaks], rehypePlugins: [rehypeImageCaptions, rehypeEmbeds] }), shikiConfig: { themes: { light: { ...dayfox, type: 'light' }, dark: { ...nightfox, type: 'dark' } } } },
});
