# choco14t.blog

Link: https://blog.choco14t.net

## Open Graph images

With Node 24 and pnpm 10.4.1, run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
pnpm preview --host 127.0.0.1 --port 4321
```

The static build renders 1200 × 630 PNGs with Satori and `@resvg/resvg-js`.
Articles use `/og/posts/<slug>.png`; home and tag pages share `/og/default.png`.
Changing a title and rebuilding regenerates its image. Deploy HTML and images
together. Draft images follow article visibility; 404 has no social metadata.
Social cards deliberately omit descriptions, preserving frontmatter and RSS.

The template, Nightfox palette, spacing, and font sizing live in
[`src/og/render.ts`](src/og/render.ts). Titles wrap and shrink from 64px to 32px;
titles that still cannot fit fail the build with a diagnostic rather than being
truncated. Inspect changed titles in the generated PNGs before publishing.
External services may retain cached previews after a rebuild.

The bundled Noto Sans CJK JP Bold font is pinned to Sans 2.004; see its
[source and license](src/og/fonts/README.md). Builds require no font/image
downloads or host fonts. A missing font or native renderer fails the build.
The native resvg package is installed as a platform-specific optional dependency;
do not disable optional dependencies. The verified installation needed no new
pnpm lifecycle-script approvals.

## Credits

Icons by [Tabler Icons](https://tabler.io/icons), licensed under the [MIT License](https://github.com/tabler/tabler-icons/blob/main/LICENSE).
