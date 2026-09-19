import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

test('obsolete Zola and Netlify sources are removed after their Astro replacements exist', () => {
  for (const path of ['.tool-versions', 'config.toml', 'content', 'netlify.toml', 'sass', 'scripts/migrate-content.py', 'static', 'templates']) {
    assert.ok(!existsSync(path), `obsolete path remains: ${path}`);
  }
  for (const path of ['astro.config.ts', 'public/icon.png', 'src/content/posts', 'src/layouts/Layout.astro', 'src/styles/style.scss']) {
    assert.ok(existsSync(path), `Astro replacement missing: ${path}`);
  }
});

test('textlint CI uses the Astro runtime while preserving its existing workflow', () => {
  const workflow = readFileSync('.github/workflows/textlint.yaml', 'utf8');
  assert.match(workflow, /node-version: 24\.18\.0/);
  assert.match(workflow, /uses: pnpm\/action-setup@v2[\s\S]*version: 10\.4\.1/);
  for (const behavior of [
    'pull_request:',
    'branches:\n      - main',
    'uses: actions/checkout@v4',
    'run: pnpm install',
    'uses: tj-actions/changed-files@v39',
    'run: pnpm textlint ${{ steps.changed-files.outputs.all_changed_files }}',
  ]) assert.ok(workflow.includes(behavior), behavior);
});

test('tests run directly as TypeScript with the Node test runner', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.scripts.test, 'node --test tests/*.test.ts');
  const testFiles = readdirSync('tests').filter(path => path.includes('.test.'));
  assert.ok(testFiles.length > 0);
  assert.ok(testFiles.every(path => path.endsWith('.test.ts')));
});
