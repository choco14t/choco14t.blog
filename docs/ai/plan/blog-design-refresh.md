# Blog Design Refresh

## Specification

### Goal

Refresh the blog without increasing the amount of information shown on each
page. Keep the home page limited to publication dates and titles while adding:

- Dayfox- and Nightfox-based light and dark themes
- a system theme mode and a persistent manual theme preference
- a responsive article table of contents
- image captions
- soft-line-break rendering similar to GitHub issues and comments
- URL-based Spotify and Bluesky embeds

The result should remain a small, static Astro site without a client UI
framework.

### Resolved Decisions

| ID | Decision | Resolution |
|---|---|---|
| D-001 | Theme modes | Provide `System`, `Light`, and `Dark`. Default to `System` and persist manual selections locally. |
| D-002 | Table of contents | Show nested `h2`/`h3` entries in a sticky desktop sidebar and a collapsible mobile block. Do not add active-section highlighting. |
| D-003 | Image caption syntax | Treat the title in `![alt](image.jpg "caption")` as the visible caption. |
| D-004 | External embeds | Convert standalone Spotify URLs to official iframes. Resolve standalone Bluesky post URLs through official oEmbed at build time and fall back to a normal link on failure. Keep X static and preserve YouTube iframes. |
| D-005 | Soft line breaks | Convert single Markdown line endings to `<br>` elements for every article. |
| D-006 | Color themes | Start with Dayfox for light mode and Nightfox for dark mode instead of designing a new palette. Apply them to the site and syntax highlighting. |
| D-007 | Theme control | Use a native select with a separate icon indicating the effective theme. |
| D-008 | Desktop TOC position | Place the table of contents to the right of the article. |

### Acceptance Criteria

1. The home page continues to show only each published post's date and title.
2. The header offers `System`, `Light`, and `Dark` theme choices.
3. The initial preference is `System`; manual choices persist in
   `localStorage`.
4. `System` follows `prefers-color-scheme`, including changes made while the
   page is open.
5. The site uses Dayfox in light mode and Nightfox in dark mode, including
   syntax-highlighted code blocks.
6. Theme initialization occurs early enough to avoid showing the wrong manual
   theme before the page is painted.
7. The theme control has an accessible label, works with a keyboard, and shows
   an icon for the effective light or dark theme.
8. On desktop, articles with at least two eligible headings show a sticky TOC
   to the right of the article body.
9. On narrow screens, that TOC appears as a collapsed `<details>` block before
   the article body.
10. The TOC contains only `h2` and `h3` headings, preserves their hierarchy,
    and links to Astro's generated heading IDs.
11. Articles with zero or one eligible heading do not show a TOC.
12. A Markdown image with a title renders as a semantic `<figure>` containing
    the image and a `<figcaption>`.
13. Image alt text remains alt text; an image without a title retains its
    current output and appearance.
14. A single line ending inside a Markdown paragraph renders as a `<br>` for
    all existing and future posts.
15. A paragraph containing only a canonical Spotify URL for a supported entity
    renders an official, responsive, lazy-loaded Spotify iframe.
16. Supported Spotify entity types are `track`, `album`, `artist`, `playlist`,
    `episode`, and `show`.
17. A paragraph containing only a canonical Bluesky post URL is resolved
    through the official Bluesky oEmbed endpoint during the static build.
18. A failed, rejected, malformed, or timed-out Bluesky response does not fail
    the build; the original URL renders as a normal link.
19. URLs used within prose, unsupported Spotify paths, and URLs from unapproved
    hosts are not converted or fetched.
20. Existing X blockquotes, YouTube iframes, local images, post URLs, tags,
    RSS output, and draft filtering continue to work.
21. Normal body text has a contrast ratio of at least 4.5:1 against its
    background in both themes.

### Non-goals

- Designing a new color palette before Dayfox and Nightfox have been evaluated
  on the live blog
- Active-section highlighting or scroll spying in the TOC
- A generic oEmbed framework
- Automatic expansion of Spotify short links
- Loading X's official JavaScript widget
- Search, comments, post excerpts, cards, or thumbnails
- A client-side UI framework

### Constraints

- Preserve Astro's static-site output; do not add an SSR adapter.
- Keep the existing URL structure and content collection schema.
- Use CSS and small browser scripts instead of a UI framework.
- Vendor the required Dayfox and Nightfox theme data at a fixed upstream
  revision; do not add a runtime dependency on the Neovim theme.
- Preserve the upstream MIT license and attribution for vendored theme data.
- Allow build-time network access only for recognized `bsky.app` post URLs and
  the fixed official `embed.bsky.app` oEmbed endpoint.
- Apply a short timeout to Bluesky requests and degrade to a link on every
  failure path.
- Treat Markdown content as trusted author input, but validate external hosts
  before performing build-time requests.

### Observable Behavior

#### Theme selection

- With no saved value, the page follows the operating-system theme.
- Selecting `Light` or `Dark` applies that theme immediately and persists it.
- Selecting `System` removes the manual override and resumes system tracking.
- If storage is unavailable or contains an invalid value, the page uses
  `System` without preventing content from rendering.
- With JavaScript disabled, content remains available and the CSS system theme
  remains usable; the manual selector is simply inactive.

#### Article layout

- Desktop articles retain a readable content width while the TOC occupies a
  separate right column.
- Mobile pages do not gain horizontal scrolling from the TOC, images, code, or
  embeds.
- TOC links move focus/navigation to the matching article heading.

#### Markdown extensions

- Image titles become visible captions without replacing alt text.
- Soft line endings become hard visual breaks without changing fenced code.
- Only provider URLs occupying their own paragraph become embeds.
- Bluesky outages or response changes produce ordinary links, not broken
  builds or empty article sections.

### Compatibility and Migration

- No persisted server data or URL migration is required.
- Existing images have no title in most cases and therefore remain unchanged.
- Existing paragraphs will gain visible breaks wherever their source contains
  a single line ending. This global behavior is intentional and requires a
  visual regression check of representative long articles.
- The saved theme preference is new and can be ignored safely by older or
  rolled-back versions of the site.
- Existing raw HTML for X and YouTube remains supported.

### Risks and Rollback

| Risk | Effect | Mitigation |
|---|---|---|
| Global soft breaks alter older prose unexpectedly | Paragraphs may become taller or break at author-wrapped lines | Inspect representative long articles in both themes before release. |
| Bluesky oEmbed is unavailable or changes format | An embed cannot be generated | Use a short timeout, validate the response, and fall back to the original link. |
| A saved theme causes a flash of the other theme | Distracting first paint | Apply a small inline initialization script in `<head>` before styled content is painted. |
| Vendored syntax colors diverge from the upstream theme | Site and code colors feel inconsistent | Pin the upstream revision, record attribution, and derive both modes from the same revision. |
| The desktop TOC reduces reading space | Article text becomes cramped at intermediate widths | Switch to the mobile `<details>` layout before the two-column layout becomes narrow. |

Rollback requires reverting the code and style changes only. There is no data
migration. A stale `localStorage` theme value is harmless after rollback.

## Implementation Plan

### Relevant Existing Code

| File | Current responsibility | Planned change |
|---|---|---|
| `astro.config.ts` | Site, Markdown, and single Nord Shiki configuration | Register Markdown plugins and dual custom Shiki themes. |
| `src/layouts/Layout.astro` | Shared document shell and header | Add early theme initialization and the theme control. Support the wider article layout without widening list pages. |
| `src/pages/index.astro` | Date-and-title post list | Preserve its information architecture; apply refreshed theme styles only. |
| `src/pages/posts/[...slug].astro` | Rendered article shell | Read `headings` from `render(post)` and add the responsive TOC layout. |
| `src/styles/_variables.scss` | Compile-time Nord colors | Replace direct Nord usage with a small set of semantic CSS custom properties backed by Dayfox and Nightfox. |
| `src/styles/_layout.scss` | Shared 800 px content container | Add the bounded two-column article layout and responsive breakpoint. |
| `src/styles/_header.scss` | Brand styling | Lay out the brand and theme control. |
| `src/styles/_post.scss` | Article typography and media | Add TOC, figure, caption, and responsive embed styles. |
| `src/styles/_code.scss` | Code block borders and inline code | Consume theme variables and Shiki's dual-theme variables. |
| `tests/layout.test.ts` | Generated shell and stylesheet checks | Assert theme initialization, control markup, and Dayfox/Nightfox CSS. |
| `tests/post-routes.test.ts` | Generated article, image, code, and dev-route checks | Add TOC, caption, embed, and dual-code-theme coverage. |
| `tests/content.test.ts`, `tests/rss.test.ts`, `tests/posts.json` | Content migration snapshots and published-post counts | Restore the stale test baseline before feature work. |

Expected new implementation files:

- `src/components/ThemeSelect.astro`
- `src/components/TableOfContents.astro`
- `src/markdown/rehype-image-captions.ts`
- `src/markdown/rehype-embeds.ts`
- two pinned Shiki-compatible Dayfox/Nightfox theme data files
- a third-party notice for the vendored theme data
- focused Markdown transformation tests under `tests/`

The exact theme asset filenames should follow the format available at the
pinned Nightfox upstream revision. Verify that revision and its license during
implementation rather than relying on an unpinned `main` branch URL.

### Baseline Evidence Gap

The production build and Astro check currently succeed, but the existing test
suite is not green before this feature:

- the repository contains 48 posts and 20 published posts, while
  `tests/posts.json` describes 47 and 19
- the stored body hash for `2022-10` is stale
- a migration-completion test still requires deployment documentation that was
  deliberately removed from `README.md`
- the sandbox used during planning cannot bind the dev-test port, so that test
  must be confirmed in a normal local or CI environment

These are pre-existing conditions. Restore the deterministic baseline before
starting feature Red-Green cycles so new failures remain attributable.

### Acceptance-Criteria Traceability

| Criteria | Implementation location | Verification |
|---|---|---|
| AC 1 | `src/pages/index.astro`, article-list styles | Generated home HTML contains one date and title link per published post and no excerpt/image markup. |
| AC 2-7 | `Layout.astro`, `ThemeSelect.astro`, theme styles, Shiki config | Shell tests, CSS inspection, keyboard/manual browser checks, and no-flash reload check. |
| AC 8-11 | Post route, `TableOfContents.astro`, layout/post styles | Generated HTML tests for nested links, desktop/mobile containers, and the one-heading boundary. |
| AC 12-13 | Image-caption rehype plugin | Markdown transformation tests and existing co-located image route tests. |
| AC 14 | `remark-breaks` registration | Markdown transformation test covering paragraphs and fenced code. |
| AC 15-19 | Embed rehype plugin | Pure URL classification tests plus stubbed Bluesky success, malformed, failure, and timeout cases. |
| AC 20 | Existing route, image, tag, RSS, and draft tests | Full build and test suite. |
| AC 21 | Theme CSS | Automated contrast calculation for primary text tokens plus visual checks. |

### TDD Sequence

#### Step 0: Restore a Green baseline

**Red/current failure**

Run the build and existing tests and retain the current failure output as
evidence.

**Green**

1. Add the current post to `tests/posts.json` and update the stale content
   snapshot.
2. Derive published counts from the fixture instead of asserting the historical
   value `19` in test names and bodies.
3. Make the fixture test compare the complete fixture path set with the actual
   Markdown path set so future missing fixture entries fail clearly.
4. Remove the obsolete test that requires the intentionally removed README
   deployment section.
5. Confirm that all remaining tests pass outside the port-restricted sandbox.

**Refactor**

Keep the content snapshot behavior, but remove historical count duplication
that becomes stale whenever a post is published.

#### Step 1: Add soft line breaks

**Red**

Add a Markdown rendering test proving that a single line ending in a paragraph
becomes `<br>`, while a fenced code block is unchanged.

**Green**

Install `remark-breaks` and register it in `astro.config.ts`.

**Refactor**

Do not write or retain a custom line-break transformer.

#### Step 2: Add semantic image captions

**Red**

Cover these cases with a focused transform test:

- an image title produces `figure > img + figcaption`
- alt text and caption text remain distinct
- an image without a title is unchanged
- caption text is emitted as text, not executable markup

**Green**

Add a small rehype transform that wraps title-bearing image elements after
Astro has resolved their source. Remove the redundant image `title` attribute
after producing the caption.

**Refactor**

Keep the transform independent from layout styling and preserve Astro's
existing co-located image pipeline.

#### Step 3: Add provider-specific URL embeds

**Red**

Test:

- every supported canonical Spotify entity URL
- query-string removal and safe ID validation
- rejection of unsupported hosts, paths, and inline prose links
- a successful Bluesky oEmbed response
- non-2xx, malformed, timed-out, and thrown Bluesky responses
- confirmation that an unapproved URL is never fetched

**Green**

1. Add one rehype plugin that recognizes a paragraph containing exactly one
   provider link.
2. Generate responsive, lazy Spotify iframe markup without a build-time
   network request.
3. Fetch Bluesky oEmbed only through the fixed official endpoint, using a
   short abort timeout.
4. Validate the response and emit raw official embed HTML only on success.
5. Leave the original link node in place on every failure path.

Inject the fetch function into the plugin's small construction seam so tests
remain deterministic. Do not add a generic provider registry or oEmbed class
hierarchy.

**Refactor checkpoint**

Confirm that provider-specific volatility is confined to this plugin and does
not leak into the article component or content schema.

#### Step 4: Introduce Dayfox and Nightfox themes

**Red**

Add generated-output tests requiring:

- all three select values and an accessible label
- the early manual-theme initializer
- Dayfox and Nightfox semantic variables
- dual-theme Shiki output
- removal of direct Nord theme assertions

Add a small contrast test for the primary foreground/background pairs.

**Green**

1. Vendor the smallest required Dayfox and Nightfox theme definitions at a
   pinned upstream revision and preserve attribution.
2. Map their colors to semantic CSS variables for page background, raised
   background, primary text, muted text, border, link, accent, and selection.
3. Configure Shiki with matching light and dark custom themes.
4. Add a short inline `<head>` script that applies only a valid stored manual
   override before paint.
5. Add `ThemeSelect.astro` with a native select and adjacent Tabler icon.
6. On change, save `light` or `dark`; remove the override for `system`.
7. Observe `matchMedia` changes only to update the effective-theme icon while
   in system mode; CSS media queries perform the visual switch.

**Refactor**

Replace remaining `$nord*` usage with semantic variables. Do not build a wider
design-token framework or palette-generation layer.

#### Step 5: Add the responsive article TOC

**Red**

Extend generated article tests to prove:

- only depth-2 and depth-3 headings appear
- generated links match heading IDs
- nesting/order is preserved
- both desktop and mobile containers exist for two or more entries
- neither exists for zero or one entry

**Green**

1. Destructure `headings` from `render(post)` in the post route.
2. Filter to `h2`/`h3` and pass the result to
   `TableOfContents.astro`.
3. Render a sticky desktop `<nav>` in the right column and a mobile
   `<details>` before the article content.
4. Introduce a wide article-only layout while retaining the current 800 px
   measure for the home and tag pages.
5. Add a breakpoint that switches to the mobile TOC before the article column
   becomes cramped.

**Refactor**

Share TOC item rendering inside the component. Do not add scroll listeners,
intersection observers, or client-side heading parsing.

#### Step 6: Visual and compatibility verification

Build and inspect the home page and representative articles at approximately
375 px, 800 px, and 1280 px in `System`, `Light`, and `Dark` modes.

The representative set must include:

- a long article with `h2` and `h3` headings
- an article with fewer than two eligible headings
- co-located images
- an image caption
- a code block
- the existing X blockquote
- the existing YouTube iframe
- Spotify and Bluesky URL embeds
- paragraphs containing intentional single line endings

Check keyboard operation, visible focus, reload persistence, live system-theme
changes, horizontal overflow, and contrast.

### Verification Commands

Run in this order because generated-output tests read `dist/`:

```sh
pnpm build
pnpm check
pnpm test
```

If Markdown article content changes during implementation, also run the
project's textlint command against the changed Markdown files.

### Current Verification Evidence

During planning:

- `node node_modules/astro/bin/astro.mjs build` succeeded and generated 34
  pages; it reported only the existing Sass `@import` deprecation warnings.
- `node node_modules/astro/bin/astro.mjs check` completed with zero errors,
  warnings, or hints.
- `node --test tests/*.test.ts` passed 9 of 15 tests. Five failures are the
  stale baseline cases described above; the sixth is the sandbox's refusal to
  bind the dev server to `127.0.0.1:43219`.
- In the planning environment, `pnpm` itself attempted a package-manager
  signature fetch and could not complete under restricted network access, so
  direct local binaries were used for the evidence above.

