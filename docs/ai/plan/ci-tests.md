# Replace Textlint CI with Test CI

## Status and Goal

Specification and implementation plan confirmed on 2026-09-20. Writing this
document is authorized; implementation has not started.

Remove textlint from the blog's development workflow and detect existing test
failures in pull requests targeting `main`.

## Confirmed Decisions

| ID | Decision | Resolution |
| --- | --- | --- |
| D-001 | Article body hashes | Remove the fixed body-hash comparison. Preserve article existence, metadata, and rendered-output checks. |

The user also confirmed removal of textlint configuration, dependencies, script,
and CI; replacement with build-and-test CI for pull requests targeting `main`;
and preservation of the two existing article edits. There are no unresolved
blocking decisions.

## Specification

### Acceptance Criteria and Traceability

| ID | Observable result | Implementation location | Verification |
| --- | --- | --- | --- |
| AC-01 | No active textlint configuration, package script, direct dependencies, or CI execution remains. | `.textlintrc`, `package.json`, `pnpm-lock.yaml`, `.github/workflows/textlint.yaml` | Updated CI regression test, dependency diff, frozen-lockfile install. |
| AC-02 | Pull requests targeting `main` run the complete existing test suite after a build. | New `.github/workflows/test.yaml` | Regression test for trigger and command order; actual PR run. |
| AC-03 | Installation, build, or test failure causes the CI job to fail. | New `.github/workflows/test.yaml` | Review normal step failure propagation and inspect the PR job result. |
| AC-04 | Article body changes do not fail a fixed hash comparison. Existing article existence, metadata, and output assertions remain. | `tests/content.test.ts` | Reproduce the current hash failure, remove the comparison, rerun the focused test and full suite. |
| AC-05 | The workflow regression test describes test CI rather than requiring textlint CI to exist. | `tests/migration-completion.test.ts` | Observe Red before the workflow replacement and Green afterward. |
| AC-06 | Existing article edits remain unchanged by this work. | `src/content/posts/2022-10/index.md`, `src/content/posts/yonda-1/index.md` | Compare their final diff with the starting diff. |

### Observable Behavior

- Keep the existing `pull_request` trigger restricted to the `main` base branch.
- Run the complete suite for each eligible PR, including article-only changes;
  do not filter the suite by changed files.
- Use one Ubuntu job with Node.js `24.18.0` and pnpm `10.4.1`, matching the
  existing workflow.
- Install using `pnpm install --frozen-lockfile`, then run `pnpm build`, then
  `pnpm test` as separate steps. Tests consume the build output in `dist/`.
- Do not suppress failures or continue to tests after a failed build.
- Keep the existing Node test runner and `test` script unchanged.

### Non-goals and Constraints

- No new test framework, coverage requirement, test matrix, or deployment step.
- No addition of `pnpm check` to CI, new push trigger, or branch-protection change.
- No article edits or redesign of article fixtures and metadata expectations.
- No changes to site components, runtime behavior, or module boundaries.
- Historical plan documents may retain references to textlint as historical
  context; they are not active configuration.
- Keep unrelated dependency versions unchanged when regenerating the lockfile.

## Repository Evidence

- `.github/workflows/textlint.yaml` currently runs only textlint on PRs targeting
  `main`, using a changed-files action to construct its arguments.
- `package.json` defines `test` as `node --test tests/*.test.ts` and includes five
  direct textlint-related development dependencies.
- `tests/layout.test.ts`, `tests/content.test.ts`, and other tests read generated
  files in `dist/`, making the build a prerequisite for the full suite.
- `tests/migration-completion.test.ts` explicitly requires the old workflow,
  runtime versions, changed-files action, and textlint invocation.
- `tests/content.test.ts` compares article body hashes against `tests/posts.json`.
  `tests/posts.ts` declares the corresponding `bodySha256` field.
- Running the focused body-preservation test during investigation failed for
  `2022-10` with a hash mismatch. The existing article edits add image titles in
  `2022-10/index.md` and `yonda-1/index.md`.

The full suite and GitHub Actions execution have not been verified during
planning. The hash failure is evidence for D-001, not a full-suite baseline.

## Implementation Plan

### 1. Establish the Regression Expectations (Red)

Update the textlint-specific test in `tests/migration-completion.test.ts` to
verify the agreed CI behavior: the `main` PR trigger, existing runtime versions,
frozen-lockfile installation, and build before test. Verify removal of the old
workflow, textlint configuration, package script, and direct dependencies.

Keep assertions focused on these requirements rather than unrelated formatting
or action implementation details. Run the test and confirm that it fails against
the existing textlint setup.

### 2. Replace the Workflow and Remove Textlint (Green)

- Replace `.github/workflows/textlint.yaml` with `.github/workflows/test.yaml`;
  use `test` as the workflow and job name.
- Preserve the runtime versions, PR trigger, and existing package-cache behavior.
  Retain the existing checkout/setup/cache action versions to avoid an unrelated
  action-upgrade project.
- Remove the changed-files action and the full-history checkout requirement.
- Run installation, build, and test in the specified order.
- Remove `.textlintrc` and the `textlint` package script.
- Remove the five direct textlint-related dependencies with pnpm and update the
  lockfile, pruning their unused transitive dependencies.
- Rerun the workflow regression test and confirm Green.

### 3. Permit Article Body Changes (Red to Green)

Reproduce the existing failing article-body test with the current article edits
left in place. This observed failure supplies the Red case; do not add a test
that merely inspects whether a hash assertion exists in source code.

Remove the hash comparison from `tests/content.test.ts`, retaining the checks
for article inventory, existence, frontmatter, and rendered output. Rerun the
focused test and confirm that these article edits no longer trigger a hash
failure. Any other failure must be investigated rather than suppressed.

### 4. Refactor and Verify

Remove the unused crypto import and body variable, and rename the test to
describe the remaining article and frontmatter checks. Remove the now-unused
`bodySha256` field from `tests/posts.ts` and `tests/posts.json`, preserving all
other fixture data. This is local cleanup; no new abstraction is needed.

Run the full verification sequence below. Review the diff for unrelated changes,
especially the two pre-existing article edits and dependency versions. Open or
update a PR only as separately authorized, and inspect its test CI result when
available.

## Verification Commands

Run commands from the repository root using Node.js `24.18.0` and pnpm `10.4.1`.

For the workflow Red/Green cycle:

```sh
node --test tests/migration-completion.test.ts
```

For the body-hash Red/Green cycle, run before renaming the test:

```sh
node --test --test-name-pattern='all posts retain' tests/content.test.ts
```

Dependency removal during implementation:

```sh
pnpm remove -D textlint textlint-filter-rule-allowlist textlint-rule-preset-ja-spacing textlint-rule-preset-ja-technical-writing textlint-rule-spellcheck-tech-word
```

Final local verification:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
git diff --check
git diff -- src/content/posts/2022-10/index.md src/content/posts/yonda-1/index.md
```

On GitHub, confirm that an eligible PR starts the new job, builds before testing,
and reports the test result. Local tests can verify workflow structure but do
not establish successful execution on GitHub's runner. Do not introduce a
deliberately failing committed test merely to exercise CI.

## Compatibility, Risks, and Rollback

- Removing the hash comparison intentionally stops detection of arbitrary body
  changes. Remaining rendering and metadata assertions still apply.
- Article inventory and metadata fixtures remain fixed expectations; adding an
  article may still require updating those fixtures.
- Build-and-test CI can expose pre-existing failures beyond the confirmed hash
  mismatch. Diagnose those failures without weakening unrelated assertions.
- Repository branch-protection settings were not inspected. If an external rule
  requires the old textlint check, report that separately; this plan does not
  authorize changing that rule or claim that tests become a merge requirement.
- There is no application or data migration. Roll back the implementation's
  workflow, package, lockfile, configuration, and test changes together, then
  reinstall dependencies. Preserve the user's unrelated article edits.
