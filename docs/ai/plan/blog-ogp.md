# Blog Open Graph Previews

## Status and Goal

Specification and implementation plan, authorized on 2026-09-19. Implementation
has not started. Enable image-and-title previews when blog URLs are shared on
services such as X and Slack, while retaining the static Astro site.

## Confirmed Decisions

| ID | Decision | Resolution |
| --- | --- | --- |
| D-001 | Feature | Provide previews of this blog when its URLs are shared externally; do not embed external link cards in articles. |
| D-002 | Scope | Include articles, home, tag index, and tag detail pages. Exclude 404. |
| D-003 | Article images | Use a Zenn-inspired card with generous spacing and gentle Nightfox palette colors. Show only the article title, without author, site name, avatar, or logo. Do not switch colors by time of sharing. |
| D-004 | Descriptions | Do not emit card description metadata, including for articles with existing frontmatter descriptions. |
| D-005 | Shared image | All non-article pages use one image containing only `blog.choco14t.net`. |

The user confirmed the combined scope and the proposed build-time
Satori-to-PNG approach, then authorized this plan file. There are no unresolved
blocking product decisions. Concrete rendering parameters below are engineering
defaults within the agreed visual direction, not separately approved mockups.

## Specification

### Acceptance Criteria

| ID | Observable result |
| --- | --- |
| AC-01 | Every published article has exactly one Open Graph title, type, URL, and image in its generated HTML. The title is the article title without the blog-name suffix; type is `article`. |
| AC-02 | Home and both kinds of tag page have website metadata with their existing page titles and their own canonical absolute URLs. All reference the same shared image. |
| AC-03 | Every image URL uses `https://blog.choco14t.net`, resolves to a generated PNG, and has matching width, height, MIME type, and useful image alt metadata. |
| AC-04 | Each article image contains only its title. The single shared image contains only `blog.choco14t.net`. Both use the agreed Zenn-inspired Nightfox design. |
| AC-05 | Images measure 1200 by 630 pixels. Japanese and mixed Japanese/Latin titles render legibly without missing glyphs or clipping. Current titles render in full. |
| AC-06 | Eligible pages emit `twitter:card=summary_large_image`, title, image, and image alt metadata. Neither Open Graph nor Twitter description metadata is emitted. |
| AC-07 | The 404 HTML contains no Open Graph or Twitter card tags. Production generates no draft article images or draft article routes. Development images follow existing development article visibility. |
| AC-08 | A normal static build creates the images without a new server, browser-side image generation, or build-time font/image downloads. Existing page titles, content, URLs, RSS, and tag behavior remain intact. |

### Observable Behavior and Defaults

- Keep the existing HTML `<title>` values. Pass a separate social title for
  articles so their card title does not acquire the existing blog-name suffix.
- Derive absolute URLs from `Astro.site`. Page URLs use the existing trailing
  slash convention and exclude query strings and fragments. Encode URL path
  segments correctly, including tags containing spaces or Japanese text.
- Use `/og/posts/<slug>.png` for article images and `/og/default.png` for the
  shared image. File endpoints must emit PNG files, not directories ending in
  `.png`; verify this under the current trailing-slash configuration.
- Use `og:image:alt` and `twitter:image:alt` for the visible title. These describe
  the image and are distinct from the omitted card descriptions.
- Preserve existing frontmatter descriptions and any RSS usage. The decision
  to omit descriptions applies to social metadata only.
- Generate images during the build. A missing font or rendering failure fails
  the build with a useful error rather than publishing broken image references.
- Use a bundled static Japanese font, such as Noto Sans CJK JP Bold in OTF
  format, with its license and pinned source recorded. Do not rely on host fonts.
- Start with a rounded light panel (`#dfdfe0`), dark text (`#192330`), and an
  outer gradient using Nightfox blue (`#719cd6`) and cyan (`#63cdcf`). These are
  palette values, not a requirement to make the image itself a dark theme.
  Use generous outer and inner padding, bold left-aligned text, and vertical
  centering. No footer or decorative brand elements.
- Wrap titles and reduce font size as needed to keep the full title inside the
  panel. Verify current longest titles plus a longer fixture. If a future title
  cannot fit at a readable minimum size, fail with a clear rendering diagnostic
  instead of silently clipping or truncating it.
- Shared images stay identical across non-article pages; their HTML card titles
  and URLs still identify the actual page being shared.

### Non-goals and Constraints

- No link-card embedding, article body changes, author metadata, per-article
  uploaded covers, automatic excerpt extraction, or AI-generated artwork.
- No time-based image changes, runtime image service, SSR adapter, React UI
  integration, new client JavaScript, or site-wide theme redesign.
- Preserve the content schema and current routes. Keep this work independent
  of `blog-design-refresh.md`; that plan is not evidence of implemented themes.
- Add only the image-generation dependencies needed: Satori and
  `@resvg/resvg-js` for SVG-to-PNG conversion. Use element objects with Satori
  instead of adding JSX infrastructure solely for this feature.
- Use Node 24 and pnpm 10.4.1 as specified by this repository. Lock dependency
  versions and check any required native-package installation approval explicitly.
- Shared-service caches and layouts are outside the site's control. Correct
  metadata does not guarantee an identical preview in every client or immediate
  refresh of a previously shared URL.

## Existing Code and Evidence

| Location | Observed responsibility and relevance |
| --- | --- |
| `astro.config.ts` | Static Astro configuration; production site URL and `trailingSlash: 'always'`; no SSR adapter. |
| `src/layouts/Layout.astro` | Shared head with a title and favicon, but no social metadata. |
| `src/pages/posts/[...slug].astro` | Reads article data and uses `!import.meta.env.PROD || !data.draft` for routes. |
| `src/pages/index.astro` | Home page with default layout title. |
| `src/pages/tags/index.astro` | Public tag list with `Tags | blog.choco14t.net` title. |
| `src/pages/tags/[tag].astro` | Public tag pages with per-tag titles. |
| `src/pages/404.astro` | Uses the same layout; must explicitly opt out of social metadata. |
| `src/content.config.ts` | Article title, slug, draft flag, and optional description already exist. |
| `tests/layout.test.ts`, `tests/post-routes.test.ts`, `tests/tags.test.ts` | Existing generated-output tests; build before running them. |
| `tests/posts.ts`, `tests/posts.json`, `tests/content.test.ts` | Historical content fixtures and fixed article counts; do not copy these counts into new OGP tests. |
| `package.json`, `pnpm-lock.yaml` | Existing check/build/test scripts and package manager settings. |

Read-only inspection found 48 Markdown article files, while the historical
content test describes 47. This is evidence of a baseline discrepancy, not a
confirmed diagnosis of all test failures. Establish the actual baseline before
implementation and distinguish existing failures from regressions. Do not
silently rewrite historical content snapshots to make the OGP work pass.

Node reported v24.18.0 during planning. `pnpm --version` failed because the
package-manager launcher could not fetch registry data to verify pnpm 10.4.1.
This does not establish that the repository was tampered with. Restore registry
access and verify the configured release without bypassing signature checks
before running the commands below. No build, tests, or textlint were run for this
documentation-only change. The renderer's native binary must also be verified
during implementation; compatibility has not been proven by this plan.

## Implementation Plan

### Planned Locations and Acceptance Traceability

New file paths in this table are proposed additions, not existing files.

| Criteria | Implementation location | Verification |
| --- | --- | --- |
| AC-01, AC-02, AC-06 | Existing layout and article route; explicit social-title/type/image inputs with shared defaults | New `tests/ogp.test.ts`: inspect every generated eligible HTML page and exact metadata cardinality/values. |
| AC-03, AC-08 | New `src/pages/og/default.png.ts`, `src/pages/og/posts/[...slug].png.ts` | Resolve emitted image URLs to files; validate PNG signature and dimensions; check preview-server response headers. |
| AC-04, AC-05 | New `src/og/render.ts` and `src/og/fonts/` with font and license | New `tests/og-image.test.ts`: renderer output and difficult titles; visual inspection of PNGs at full and preview sizes. |
| AC-07 | Existing 404 layout invocation and new article image endpoint | Assert no social metadata on 404; compare production article/image slug sets; check a draft in development. |
| AC-08 | Package files, renderer, endpoints, existing page callers | Existing check/build/test commands; confirm no new client script or runtime font fetch. |

### Ordered TDD Slices

1. Establish the baseline with the commands below. Record existing failures and
   inspect real article titles and slugs, especially long Japanese titles and
   special characters. Derive OGP route expectations from current content rather
   than the historical fixed published count.
2. **Red:** Add output tests for the home page's website metadata, shared PNG,
   absent descriptions, and the 404 opt-out. Rebuild and observe the expected
   missing-metadata/image failures.
   **Green:** Add the minimal renderer with bundled font, shared image endpoint,
   layout metadata, and explicit 404 opt-out. Add and lock Satori and resvg.
   Rebuild and pass this slice's tests.
3. **Red:** Test one published article through its HTML and image URL, including
   an unsuffixed title, article type, absolute URLs, PNG dimensions, and no
   description even when frontmatter contains one.
   **Green:** Add the article image endpoint using `getStaticPaths()` and current
   article visibility rules; supply the article metadata from its page.
4. **Red:** Cover all published articles, both tag page types, encoded URLs,
   exactly one shared non-article image, absent draft images in production, and
   development access to a representative draft image.
   **Green:** Correct routing and metadata behavior until these public-output
   checks pass. Reuse the existing dev-server test pattern and always terminate
   the spawned server.
5. **Red:** Exercise the real renderer with short, longest-current, mixed-script,
   punctuation-heavy, and longer synthetic titles. Assert valid PNG output;
   test any explicit overflow failure through the renderer's public interface.
   **Green:** Implement only the wrapping/font-sizing logic required. Open the
   images to check typography, spacing, glyph coverage, and clipping; binary
   checks alone do not prove visual correctness.
6. **Refactor:** Keep the template, font loading, sizing, and rendering together
   in `src/og/render.ts`; keep endpoints as thin content-to-image adapters and
   metadata in the existing layout. Avoid a generic SEO framework, theme engine,
   or provider abstraction. Run the relevant tests after refactoring.
7. Complete check/build/test verification and document the image-generation
   setup in the README: commands, font source/license, palette location, and
   how changing titles regenerates images. Record unresolved baseline failures
   separately rather than reporting a fully passing suite.

### Verification Commands

Run from the repository root with Node 24 and pnpm 10.4.1:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
```

After the planned test files exist, focused checks are:

```sh
pnpm build
node --test tests/ogp.test.ts tests/og-image.test.ts
pnpm textlint docs/ai/plan/blog-ogp.md
pnpm preview --host 127.0.0.1 --port 4321
```

The preview command is a manual inspection server; stop it after inspection.
Check `/og/default.png` and an actual generated article image route for status,
`image/png`, dimensions, and visual appearance. Inspect a short title, the
longest current title, Japanese/Latin text, and the common image at 1200 by 630
and at approximately half size. Check that the corresponding page source has
the expected absolute metadata URLs.

After an independently authorized deployment, confirm that public page/image
URLs are accessible without authentication and inspect real X/Slack previews.
Do not claim this production verification was completed using local HTML tests.

## Compatibility, Risks, and Rollback

- No data migration, article edits, or URL changes are needed. Deploy generated
  HTML and images together using the existing static deployment process.
- Missing glyphs and title overflow are the main visual risks. Bundled fonts,
  actual-title coverage, explicit overflow diagnostics, and manual PNG review
  address them. Do not fetch fallback fonts at build time.
- Native resvg installation may differ between developer and build machines.
  Verify the installed package on the actual build platform before release;
  investigate a failure rather than adding an unverified fallback dependency.
- Stable image URLs can remain cached after title or design changes. Validate
  new shares and use a provider's refresh facility when available; time-based
  variants and cache-busting infrastructure are outside this scope.
- The existing design-refresh plan also touches the layout. Preserve unrelated
  edits and integrate only the social metadata changes if that work lands first.
- Roll back by reverting OGP code, dependencies, fonts, and metadata together,
  then rebuilding and redeploying the previous static site. There is no persisted
  state to migrate back. External preview caches may outlive the rollback.

## Sources

- Open Graph fields and optional description: https://ogp.me/
- Astro static file endpoints: https://docs.astro.build/en/guides/endpoints/
- Satori output, element objects, and fonts: https://github.com/vercel/satori
- PNG rendering: https://github.com/thx/resvg-js
- Nightfox palette: https://github.com/EdenEast/nightfox.nvim/blob/main/lua/nightfox/palette/nightfox.lua
- Japanese font upstream: https://github.com/notofonts/noto-cjk

The palette values above were checked on 2026-09-19. When bundling upstream
assets, record their exact revision and retain the applicable license notices.
