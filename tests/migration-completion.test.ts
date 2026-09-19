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

test('test CI builds before running the complete suite for pull requests to main', () => {
  for (const path of ['.github/workflows/textlint.yaml', '.textlintrc']) {
    assert.ok(!existsSync(path), `obsolete textlint configuration remains: ${path}`);
  }
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.ok(!('textlint' in packageJson.scripts));
  for (const name of Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })) {
    assert.doesNotMatch(name, /textlint/);
  }

  const workflow = readFileSync('.github/workflows/test.yaml', 'utf8');
  assert.match(workflow, /on:\s*\n\s+pull_request:\s*\n\s+branches:\s*\n\s+- main\s*\n/);
  assert.doesNotMatch(workflow, /(?:paths(?:-ignore)?|branches-ignore|push|continue-on-error|if):/);
  assert.match(workflow, /runs-on: ubuntu-latest/);
  assert.match(workflow, /node-version: 24\.18\.0/);
  assert.match(workflow, /uses: pnpm\/action-setup@v2[\s\S]*version: 10\.4\.1/);
  const commands = [...workflow.matchAll(/^\s+run: (pnpm .+)$/gm)].map(match => match[1]);
  assert.deepEqual(commands, ['pnpm install --frozen-lockfile', 'pnpm build', 'pnpm test']);
  assert.doesNotMatch(workflow, /textlint|changed-files/);
});

test('tests run directly as TypeScript with the Node test runner', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.scripts.test, 'node --test tests/*.test.ts');
  const testFiles = readdirSync('tests').filter(path => path.includes('.test.'));
  assert.ok(testFiles.length > 0);
  assert.ok(testFiles.every(path => path.endsWith('.test.ts')));
});
