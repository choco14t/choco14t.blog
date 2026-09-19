import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  site: 'https://blog.choco14t.net',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  markdown: { processor: unified({ remarkPlugins: [remarkBreaks] }), shikiConfig: { theme: 'nord' } },
});
