import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';
import rehypeImageCaptions from './src/markdown/rehype-image-captions.ts';
import rehypeEmbeds from './src/markdown/rehype-embeds.ts';

export default defineConfig({
  site: 'https://blog.choco14t.net',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  markdown: { processor: unified({ remarkPlugins: [remarkBreaks], rehypePlugins: [rehypeImageCaptions, rehypeEmbeds] }), shikiConfig: { theme: 'nord' } },
});
