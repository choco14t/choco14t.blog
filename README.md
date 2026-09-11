# choco14t.blog

Link: https://blog.choco14t.net

## Deployment

Configure Cloudflare Pages with these production settings:

- Production branch: `main`
- Build command: `pnpm build`
- Build output directory: `dist`
- Environment variables: `NODE_VERSION=24.18.0` and `PNPM_VERSION=10.4.1`

Enable Cloudflare Web Analytics in the Pages dashboard, then redeploy so Cloudflare injects the analytics beacon. No application token or script is required.

After merging to `main`, verify the Pages deployment before switching the `blog.choco14t.net` DNS record. Keep the Netlify project available for immediate rollback by restoring its DNS target.

## Credits

Icons by [Tabler Icons](https://tabler.io/icons), licensed under the [MIT License](https://github.com/tabler/tabler-icons/blob/main/LICENSE).
