# Zola → Astro Migration

## Specification

### Goal

choco14t.blog を Zola（Rust 製 SSG）から Astro（TypeScript 製 SSG）へ移行し、ホスティングを Netlify から Cloudflare Pages に変更する。

**動機:**
- Zola ではスタイルの細かい調整やカスタマイズがしづらい
- Cloudflare Pages での Zola サポートがメンテナンスされていない
- JS/TS エコシステムの活用による将来的な機能拡張の基盤づくり

### Acceptance Criteria

1. 公開 19 記事すべてが `/posts/<slug>/` の URL で表示される（現行と同一パス）
2. ドラフト 28 記事が本番ビルド (`pnpm build`) で除外される
3. ドラフト記事が dev サーバー (`pnpm dev`) で表示される
4. ページバンドル内の co-located 画像（`2023-03/`, `send-request-id-from-gateway/` 等）が正しく表示される
5. Nord ダークテーマのデザインが現行サイトと視覚的に一致する
6. コードブロックで Nord シンタックスハイライトが適用される
7. タグ一覧ページ (`/tags/`) が全タグをリスト表示する
8. タグ個別ページ (`/tags/<tag>/`) が該当記事を一覧表示する（タグバッジ付き）
9. RSS フィード (`/rss.xml`) が公開記事のみを含み出力される
10. Cloudflare Web Analytics が動作する
11. `blog.choco14t.net` で Cloudflare Pages 経由でアクセスできる
12. textlint ワークフローが引き続き動作する

### Non-goals

- デザインのリニューアル（現行デザインの 1:1 再現のみ）
- 検索機能の追加
- ダーク/ライトモード切替
- SSR の利用
- Google Analytics (GA4) の維持
- SCSS ファイルの内容変更

### Constraints

- URL 構造 `/posts/<slug>/` を完全維持（SEO・外部リンク保護）
- SSG のみ — SSR アダプター不要
- SCSS ファイルは内容を変更せずそのまま移行する
- pnpm をパッケージマネージャーとして使用
- mise.toml で Node.js バージョンを管理

### Decisions

| ID | 決定事項 | 選択 | 理由 |
|---|---|---|---|
| D-001 | Analytics | Cloudflare Web Analytics に移行 | ホスティングと管理の一元化、Cookie 不要 |
| D-002 | 切り替え戦略 | Big-bang DNS 切り替え | 閲覧ユーザーが少なく多少のダウンタイムは許容 |
| D-003 | 移行スコープ | 純粋な移行のみ | 移行とリデザインの問題を混同しない |
| D-004 | Node.js バージョン管理 | mise (mise.toml) | 既存ツールチェーンを継続利用 |

### Observable Behavior

- **成功**: 現行サイトと同一の見た目・URL・機能が Cloudflare Pages 上で再現される。Analytics が Cloudflare Web Analytics に切り替わる
- **失敗**: 画像が表示されない、URL が変わる、スタイルが崩れる、RSS が出力されない
- **エッジケース**: 特殊文字を含むタグ（`Node.js`, `React Native`, `Claude Code`）の URL エンコーディング・マッチング

### Risks and Rollback

| リスク | 影響 | 対策 |
|---|---|---|
| ページバンドルの画像パス解決 | 画像 8 記事が表示不可 | `2023-03/`（画像 6 枚）で早期テスト。失敗時は `public/posts/<slug>/` に移動 |
| タグ URL エンコーディング | 特殊文字タグのページが 404 | `Node.js`, `React Native` 等を含む記事で検証 |
| 日付パース | ビルドエラーまたは誤ソート | `+09:00` と `Z` の両形式を `z.coerce.date()` で明示テスト |
| Shiki と既存 CSS の競合 | コードブロックのスタイル崩れ | Shiki Nord テーマと `_code.scss` のボーダー・overflow 設定を視覚確認 |
| Cloudflare Pages ビルド失敗 | デプロイ不可 | ローカルビルド成功を先に確認。`pnpm build` + `pnpm preview` |

**ロールバック**: Netlify のプロジェクトは削除しない。問題発生時は DNS を Netlify に戻すことで即時復旧可能。

---

## Implementation Plan

### Relevant Existing Code

**Zola 設定・テンプレート:**

| ファイル | 役割 | 移行先 |
|---|---|---|
| `config.toml` | サイト設定（URL, 言語, Sass, RSS, taxonomy, GA ID） | `astro.config.ts` |
| `templates/base.html` | 共通レイアウト（head, header, footer, GA script） | `src/layouts/Layout.astro` |
| `templates/index.html` | 記事一覧（日付 + タイトル、`<article class="article">`） | `src/pages/index.astro` |
| `templates/page.html` | 個別記事（タイトル, タグ, content） | `src/pages/posts/[...slug].astro` |
| `templates/404.html` | Not Found ページ | `src/pages/404.astro` |
| `templates/tags/list.html` | タグ一覧（`<ul>` リスト） | `src/pages/tags/index.astro` |
| `templates/tags/single.html` | タグ別記事一覧（日付 + タグバッジ + タイトル） | `src/pages/tags/[tag].astro` |
| `netlify.toml` | Netlify ビルド設定 | 削除（CF Pages ダッシュボードで設定） |

**SCSS（`sass/` → `src/styles/`、内容変更なし）:**

| ファイル | 内容 |
|---|---|
| `style.scss` | エントリポイント。`_variables` 〜 `_code` をインポート + グローバルスタイル |
| `_variables.scss` | Nord カラーパレット（`$nord0` 〜 `$nord15`） |
| `_layout.scss` | `.container`, `.content`（max-width: 800px） |
| `_header.scss` | `.header`, `.brand` |
| `_footer.scss` | `.footer`, `.footer-container`, `.footer-inner`, `.footer-ga` |
| `_article.scss` | `.article`, `.meta-container`, `.meta`（一覧ページ用） |
| `_post.scss` | `.post-title`, `.post-content`, `.tag-container`（個別記事用） |
| `_tag.scss` | `.tag-top`（タグページ用） |
| `_code.scss` | `.code-title`, `pre` ボーダー・overflow |
| `_reset.scss` | **未使用**（`style.scss` にインポートされていない。同等のリセットが `style.scss` 内に直接記述されている） |

**コンテンツ:**
- 48 Markdown ファイル（`_index.md` 含む）、TOML フロントマター
- 公開 19 記事、ドラフト 28 記事
- 画像を含むページバンドル: `2022-10/`, `2023-03/`, `made-nord-theme-for-inkdrop/`, `make-mysql8-accessible-from-sequelpro/`, `migrate-rails-to-nestjs/`, `notify-discord-of-the-coverage-report-output-by-circle-ci/`, `resolve-vulnerabilities-in-installed-npm-packages/`, `send-request-id-from-gateway/`, `setup-for-writing-php-with-vscode/`, `todays-ice/`, `yonda-1/`
- 静的アセット: `static/icon.png` のみ

**CI/CD:**
- `.github/workflows/textlint.yaml` — SSG 非依存（維持）
- `.github/renovate.json` — 依存管理（Astro 移行後にパッケージ更新対象が変わる）

### Acceptance-Criteria Traceability

| AC# | 実装箇所 | 検証方法 |
|---|---|---|
| 1 | `src/pages/posts/[...slug].astro` — `getStaticPaths()` で `slug` フロントマターをパスに使用 | `pnpm build` 後、`dist/posts/` 以下のディレクトリ名を確認 |
| 2 | `[...slug].astro`, `index.astro` — `import.meta.env.PROD` で `draft !== true` フィルタ | `pnpm build` 後、`dist/` にドラフト記事のディレクトリが存在しないことを確認 |
| 3 | 同上 — dev 時はフィルタなし | `pnpm dev` でドラフト記事にアクセスして表示を確認 |
| 4 | `[...slug].astro` — Markdown 内の相対パス画像が Astro で解決されるかテスト | `2023-03/` の画像 6 枚がブラウザで表示されることを確認 |
| 5 | `src/styles/` — SCSS を変更なしで移行。`Layout.astro` で `import` | 現行サイトとのスクリーンショット比較 |
| 6 | `astro.config.ts` — `markdown.shikiConfig.theme: 'nord'` | コードブロック付き記事（例: `agentic-coding-202602`）で視覚確認 |
| 7 | `src/pages/tags/index.astro` — 全記事からタグ収集・重複排除・ソート | `/tags/` ページの表示確認 |
| 8 | `src/pages/tags/[tag].astro` — `getStaticPaths()` でタグごとパス生成 | `/tags/AI/` 等にアクセスして記事一覧 + タグバッジの表示確認 |
| 9 | `src/pages/rss.xml.ts` — `@astrojs/rss` 使用、ドラフト除外 | `/rss.xml` の出力内容を確認 |
| 10 | `Layout.astro` — Cloudflare Web Analytics ビーコンスクリプト | CF Pages ダッシュボードで Analytics 有効化後、ビーコン読み込みを確認 |
| 11 | CF Pages ダッシュボード設定 + DNS 切り替え | `blog.choco14t.net` へのアクセス確認 |
| 12 | `.github/workflows/textlint.yaml` — 変更なし | PR を作成して textlint が実行されることを確認 |

### Implementation Steps

作業ブランチ: `migrate/astro`

#### Step 1: プロジェクトスキャフォールド

1. `migrate/astro` ブランチを作成
2. `pnpm init` で `package.json` を作成
3. `pnpm add astro @astrojs/rss` + `pnpm add -D sass typescript @astrojs/check`
4. `astro.config.ts` を作成:
   ```ts
   import { defineConfig } from 'astro/config';

   export default defineConfig({
     site: 'https://blog.choco14t.net',
     markdown: {
       shikiConfig: {
         theme: 'nord',
       },
     },
   });
   ```
5. `tsconfig.json` を作成（Astro の `strict` プリセット使用）
6. `mise.toml` を作成: `[tools]` セクションに `nodejs = "<version>"`
7. `.gitignore` を更新: `node_modules/`, `dist/`, `.astro/` を追加
8. `package.json` に scripts を追加: `dev`, `build`, `preview`

**検証**: `pnpm build` が空プロジェクトとして成功すること

#### Step 2: SCSS ファイル移動

1. `sass/` 以下の全ファイルを `src/styles/` にコピー
   - `style.scss`, `_variables.scss`, `_layout.scss`, `_header.scss`, `_footer.scss`, `_article.scss`, `_post.scss`, `_tag.scss`, `_code.scss`
   - `_reset.scss` は**含めない**（現行でもインポートされていない）

**検証**: ファイル数・内容が一致すること

#### Step 3: Layout.astro 作成

`templates/base.html` を `src/layouts/Layout.astro` に変換:
- `import '../styles/style.scss'` で SCSS をインポート
- Props: `title` (string, default: `'blog.choco14t.net'`)
- GA4 スクリプトは**含めない**（D-001: Cloudflare Web Analytics に移行）
- フッターから GA ポリシー開示文を**削除**（`.footer-ga` セクション全体を除去）
- フッターは copyright のみ: `<address>&copy; choco All rights reserved.</address>`
- `<link rel="icon" href="/icon.png">` を維持
- `<slot />` でコンテンツ挿入

**検証**: `pnpm dev` で空ページが表示され、Nord ダークテーマの背景色・フォントが適用されること

#### Step 4: 404.astro 作成

`templates/404.html` を `src/pages/404.astro` に変換:
- Layout を使用、title: `'Not Found | blog.choco14t.net'`
- `<h1>Not Found</h1>` + `<p>ページが見つかりませんでした</p>`

**検証**: `pnpm dev` で `/404` にアクセスして表示確認

#### Step 5: コンテンツ移動 + フロントマター変換

1. `content/posts/` を `src/content/posts/` にコピー（ディレクトリ構造維持）
2. `_index.md` は**除外**（Astro では不要）
3. フロントマター変換スクリプトを作成・実行:

   変換ルール:
   - `+++` 区切り → `---` 区切り
   - TOML key-value → YAML key-value
   - `[taxonomies]` セクション下の `tags` → トップレベル `tags`
   - `[extra]` セクション → 削除（`category` フィールドはテンプレート未使用）
   - `description` → 存在する記事のみ維持（15 記事）
   - 日付文字列はそのまま維持

   変換例:
   ```
   # Before (TOML)                    # After (YAML)
   +++                                ---
   title = "記事タイトル"              title: "記事タイトル"
   slug = "article-slug"              slug: "article-slug"
   draft = false                      draft: false
   date = 2026-02-26T15:00:00+09:00   date: 2026-02-26T15:00:00+09:00
                                      tags:
   [taxonomies]                         - "AI"
   tags = ["AI", "Claude Code"]         - "Claude Code"
                                      ---
   [extra]
   category = "Tech"
   +++
   ```

**検証**: 全 47 記事のフロントマターが YAML 形式であること（`---` 区切り、ネストなし）

#### Step 6: Content Collection スキーマ作成

`src/content.config.ts` を作成:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    draft: z.boolean().default(false),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
```

**検証**: `pnpm build` がスキーマバリデーションエラーなく成功すること（全 47 記事）

#### Step 7: index.astro 作成

`templates/index.html` を `src/pages/index.astro` に変換:
- `getCollection('posts')` で記事取得
- `import.meta.env.PROD` の場合 `draft !== true` でフィルタ
- `date` で降順ソート
- 各記事を `<article class="article">` で表示
- 日付フォーマット: `YYYY-MM-DD`
- リンク先: `/posts/${post.data.slug}/`

**検証**: `pnpm dev` でトップページに記事一覧が表示されること

#### Step 8: [...slug].astro 作成 + 画像テスト

`templates/page.html` を `src/pages/posts/[...slug].astro` に変換:
- `getStaticPaths()` で全記事からパス生成
- パスパラメータは `post.data.slug` を使用
- タイトル `<h1 class="post-title">`
- タグリンク: `.tag-container` 内に `<a href="/tags/<tag>/" class="tag">`
- `<section class="post-content">` 内に `<Content />` コンポーネント

**画像テスト（AC#4）**: この時点で `2023-03/` の画像 6 枚（`tansei_1.jpg`, `tansei_2.jpg`, `camera.jpg`, `horaibashi.jpg`, `sawayaka.jpg`, `tos.jpg`）が表示されるか確認。

- **成功**: 相対パス画像が glob ローダーで解決される → 追加作業不要
- **失敗**: 画像を `public/posts/<slug>/` に移動し、Markdown 内のパスを `/<slug>/<filename>` に更新

**検証**: コードブロック付き記事で Nord ハイライト確認 + 画像付き記事で表示確認

#### Step 9: タグページ作成

`src/pages/tags/index.astro`:
- 全記事からタグ収集 → `Set` で重複排除 → ソート
- `<h1>Tags</h1>` + `<ul>` でタグリスト

`src/pages/tags/[tag].astro`:
- `getStaticPaths()` でタグごとにパス生成
- タグ名見出し + 該当記事一覧
- **各記事にタグバッジを表示**（`tags/single.html` の構造に準拠: `.meta-container` 内に日付 + タグバッジ）

**検証**: `/tags/` と `/tags/AI/` 等にアクセス。特殊文字タグ（`Node.js`, `React Native`）の URL が正しく生成・マッチすること

#### Step 10: RSS フィード作成

`src/pages/rss.xml.ts`:
- `@astrojs/rss` の `rss()` 関数使用
- `site` は `astro.config.ts` から取得
- `items`: 公開記事のみ（`draft !== true`）
- `customData: '<language>ja</language>'`
- 各 item: `title`, `pubDate` (date), `link` (`/posts/${slug}/`)

**検証**: `/rss.xml` の出力に公開記事のみ含まれること

#### Step 11: 静的アセット移動

- `static/icon.png` → `public/icon.png`

**検証**: `/icon.png` がブラウザでアクセス可能

#### Step 12: ローカルビルド・全体検証

1. `pnpm build` 成功確認
2. `pnpm preview` でローカルプレビュー
3. 全 AC の確認:
   - `dist/posts/` 以下に公開 19 記事分のディレクトリが存在
   - `dist/posts/` 以下にドラフト記事が存在しない
   - 画像付き記事の画像表示
   - Nord テーマの視覚一致
   - タグページの動作
   - RSS フィード内容
4. 現行サイト (`blog.choco14t.net`) とのスクリーンショット比較

#### Step 13: Cloudflare Pages 設定 + DNS 切り替え

1. Cloudflare Pages でプロジェクト作成
   - リポジトリ連携
   - ビルドコマンド: `pnpm build`
   - 出力ディレクトリ: `dist`
   - ブランチ: `main`（マージ後）
2. Cloudflare Web Analytics を有効化、ビーコンスクリプトの JS スニペットを取得
3. `Layout.astro` にビーコンスクリプトを追加（`</body>` 直前）
4. `blog.choco14t.net` の DNS を Cloudflare Pages に向ける（Big-bang 切り替え）
5. HTTPS 証明書の発行を確認

#### Step 14: クリーンアップ

1. Zola ファイル削除:
   - `config.toml`
   - `netlify.toml`
   - `templates/`（全ファイル）
   - `sass/`（全ファイル — `src/styles/` にコピー済み）
   - `content/`（全ファイル — `src/content/posts/` にコピー済み）
2. `.tool-versions` が存在する場合は削除
3. `.github/renovate.json` を Astro/Node.js のパッケージ管理に合わせて確認・更新

**検証**: `pnpm build` が引き続き成功すること

### TDD Sequence

静的サイト移行のため、ユニットテストではなくビルド出力の検証が主な「テスト」となる。各ステップで以下の Red-Green サイクルを適用:

1. **Red**: 新しいページ/コンポーネントを作成する前に、期待する出力（URL パス、HTML 構造、表示内容）を明確にする
2. **Green**: 最小限の実装でビルドを通し、期待する出力が得られることを確認
3. **Refactor**: 重複するロジック（ドラフトフィルタ、日付フォーマット等）があればヘルパーに抽出

**垂直スライス:**
- Slice 1: Layout + 404（最小の表示確認）
- Slice 2: Content Collection + index（記事一覧が表示される）
- Slice 3: [...slug]（個別記事 + 画像テスト — 技術リスクの早期検証）
- Slice 4: タグページ（taxonomy 機能）
- Slice 5: RSS（フィード出力）

### Compatibility and Migration

- **URL 互換性**: `slug` フロントマターフィールドをパスに使用することで、Zola と同一の URL 構造を維持
- **RSS 互換性**: `/rss.xml` のパスを維持。既存の RSS リーダー購読者への影響なし
- **DNS 移行**: Netlify プロジェクトは削除しない。ロールバック時に DNS を戻すだけで復旧可能
- **CI**: textlint ワークフローは SSG 非依存のため変更不要
- **Renovate**: Astro 移行後は Node.js パッケージが依存対象に変わる。既存の `renovate.json` を確認

### Verification Commands

```sh
# ビルド成功
pnpm build

# ローカルプレビュー
pnpm preview

# 公開記事数の確認（19 記事）
ls dist/posts/ | wc -l

# 特定の記事が生成されていることの確認
ls dist/posts/agentic-coding-202602/index.html

# ドラフト記事が除外されていることの確認（存在しないことを検証）
# ※ ドラフト記事の slug を指定
ls dist/posts/<draft-slug>/index.html  # → "No such file or directory" が期待値

# RSS フィードの確認
cat dist/rss.xml

# タグページの確認
ls dist/tags/

# Astro の型チェック
pnpm astro check
```

手動検証:
- `pnpm dev` でドラフト記事が表示されること
- 画像付き記事のブラウザ表示確認
- コードブロック付き記事の Nord ハイライト確認
- 現行サイトとのスクリーンショット比較
- Cloudflare Web Analytics ダッシュボードでビーコン受信確認
