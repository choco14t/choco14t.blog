import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog.choco14t.net',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  markdown: { shikiConfig: { theme: 'nord' } },
});
