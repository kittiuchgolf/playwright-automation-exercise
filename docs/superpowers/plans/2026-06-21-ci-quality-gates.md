# CI Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-job CI workflow into a 6-job pipeline with quality gates (lint, typecheck, security, api, web → quality-gate), plus CI-only reporters, a dependency-free step-summary, and a README badge.

**Architecture:** GitHub Actions jobs run in parallel; a final `quality-gate` job `needs` all of them and is the single required status check. ESLint (flat config) + Prettier provide the lint/format gate; `npm audit` the security gate. Playwright gains `github` + `json` reporters on CI; a small Node script renders a Markdown results table into the run summary.

**Tech Stack:** GitHub Actions, ESLint 9 (flat config) + typescript-eslint 8, Prettier 3, Playwright reporters, Node (ESM).

---

## File Structure

| File | Responsibility |
|---|---|
| `eslint.config.js` (new) | Flat ESLint config for `src`/`tests`/`scripts` |
| `.prettierrc.json` (new) | Prettier rules (match existing code style) |
| `.prettierignore` (new) | Exclude reports, lockfile, markdown |
| `package.json` (modify) | `lint`/`format` scripts + dev deps |
| `playwright.config.ts` (modify) | Add `github` + `json` reporters on CI |
| `scripts/ci-summary.mjs` (new) | Render `results.json` → `$GITHUB_STEP_SUMMARY` |
| `.gitignore` (modify) | Ignore `results.json` |
| `.github/workflows/ci.yml` (rewrite) | 6-job gated pipeline |
| `README.md` (modify) | CI badge + branch-protection note |

---

### Task 1: ESLint + Prettier config, scripts, dependencies

**Files:**
- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`
- Modify: `package.json`

- [ ] **Step 1: Create `.prettierrc.json`**

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

- [ ] **Step 2: Create `.prettierignore`**

```gitignore
node_modules
playwright-report
allure-report
allure-results
test-results
blob-report
results.json
package-lock.json
**/*.md
```

- [ ] **Step 3: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'allure-report/**',
      'allure-results/**',
      'test-results/**',
      'blob-report/**',
      'results.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // Node globals for the plain-JS config + scripts.
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // Playwright fixtures use `async ({}, use) => {}`; the empty pattern is idiomatic.
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
```

- [ ] **Step 4: Add scripts + dev deps to `package.json`**

Add these to `"scripts"`:

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
```

Add these to `"devDependencies"`:

```json
    "@eslint/js": "^9.17.0",
    "eslint": "^9.17.0",
    "eslint-config-prettier": "^9.1.0",
    "globals": "^15.14.0",
    "prettier": "^3.4.2",
    "typescript-eslint": "^8.18.0",
```

- [ ] **Step 5: Install**

Run: `npm install`
Expected: packages added, no errors.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore package.json package-lock.json
git commit -m "chore: add eslint + prettier tooling"
```

---

### Task 2: Normalize existing code to pass lint + format

**Files:**
- Modify: any `src/**`, `tests/**`, `scripts/**`, config files Prettier/ESLint touch.

- [ ] **Step 1: Auto-format**

Run: `npm run format`
Expected: Prettier rewrites files to the configured style; prints the formatted file list.

- [ ] **Step 2: Auto-fix lint**

Run: `npm run lint:fix`
Expected: ESLint fixes what it can.

- [ ] **Step 3: Verify lint is clean**

Run: `npm run lint`
Expected: exits 0 with no errors. If any remain, fix them directly (e.g. remove an unused import/var; the rules are recommended-level and findings should be minor).

- [ ] **Step 4: Verify format is clean**

Run: `npm run format:check`
Expected: "All matched files use Prettier code style!" (exit 0).

- [ ] **Step 5: Confirm tests still pass (formatting is behavior-neutral)**

Run: `npm run test:api`
Expected: 11 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "style: apply eslint + prettier to codebase"
```

---

### Task 3: CI-only Playwright reporters + gitignore

**Files:**
- Modify: `playwright.config.ts`, `.gitignore`

- [ ] **Step 1: Update the reporter block in `playwright.config.ts`**

Replace the imports line and the `reporter:` array. New top of file:

```ts
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL ?? 'https://automationexercise.com';
const API_URL = process.env.API_URL ?? 'https://automationexercise.com';

const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never' }],
  ['allure-playwright'],
];
if (process.env.CI) {
  reporters.push(['github'], ['json', { outputFile: 'results.json' }]);
}
```

Then set `reporter: reporters,` in the `defineConfig({ ... })` call (replacing the
existing inline `reporter: [...]` array).

- [ ] **Step 2: Add `results.json` to `.gitignore`**

Append a line `results.json` to `.gitignore`.

- [ ] **Step 3: Typecheck + lint the change**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all pass. (If format:check flags the config, run `npm run format` and re-check.)

- [ ] **Step 4: Verify CI reporters activate without breaking a run**

Run: `CI=true npx playwright test --project=api`
Expected: 11 passed; a `results.json` file is produced in the repo root.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts .gitignore
git commit -m "ci: add github + json reporters when running in CI"
```

---

### Task 4: Step-summary script

**Files:**
- Create: `scripts/ci-summary.mjs`

- [ ] **Step 1: Create `scripts/ci-summary.mjs`**

```js
import fs from 'node:fs';

const project = process.argv[2] ?? 'tests';
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
const resultsPath = 'results.json';

if (!fs.existsSync(resultsPath)) {
  console.log(`No ${resultsPath} found; skipping summary for ${project}.`);
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const stats = report.stats ?? {};
const passed = stats.expected ?? 0;
const failed = stats.unexpected ?? 0;
const flaky = stats.flaky ?? 0;
const skipped = stats.skipped ?? 0;
const total = passed + failed + flaky + skipped;
const durationS = ((stats.duration ?? 0) / 1000).toFixed(1);

const failedTitles = [];
const walk = (suites = []) => {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      if (spec.ok === false) failedTitles.push(`${suite.title} › ${spec.title}`);
    }
    walk(suite.suites);
  }
};
walk(report.suites);

const icon = failed > 0 ? '❌' : '✅';
let md = `## ${icon} ${project} test results\n\n`;
md += '| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped | ⏱️ Duration |\n';
md += '|------:|---------:|---------:|--------:|----------:|------------:|\n';
md += `| ${total} | ${passed} | ${failed} | ${flaky} | ${skipped} | ${durationS}s |\n`;

if (failedTitles.length > 0) {
  md += '\n### Failed tests\n';
  for (const title of failedTitles) md += `- ${title}\n`;
}

if (summaryFile) {
  fs.appendFileSync(summaryFile, `${md}\n`);
  console.log(`Wrote ${project} summary to GITHUB_STEP_SUMMARY.`);
} else {
  console.log(md);
}
```

- [ ] **Step 2: Lint the new script**

Run: `npm run lint && npm run format:check`
Expected: pass. (Run `npm run format` if format:check flags it.)

- [ ] **Step 3: Validate against a real report locally**

Run:
```bash
CI=true npx playwright test --project=api
GITHUB_STEP_SUMMARY=/tmp/summary.md node scripts/ci-summary.mjs api
cat /tmp/summary.md
```
Expected: a Markdown table showing Total 11 / Passed 11 / Failed 0, written to `/tmp/summary.md`.

- [ ] **Step 4: Commit**

```bash
git add scripts/ci-summary.mjs
git commit -m "ci: add dependency-free step-summary script"
```

---

### Task 5: Rewrite the CI workflow as a gated pipeline

**Files:**
- Rewrite: `.github/workflows/ci.yml`

- [ ] **Step 1: Replace `.github/workflows/ci.yml` with**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm audit --audit-level=high

  api:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Run API tests
        run: npx playwright test --project=api
        env:
          CI: 'true'
      - name: Test summary
        if: always()
        run: node scripts/ci-summary.mjs api
      - name: Upload API HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-api
          path: playwright-report/
          retention-days: 14

  web:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run web tests
        run: npx playwright test --project=web
        env:
          CI: 'true'
      - name: Test summary
        if: always()
        run: node scripts/ci-summary.mjs web
      - name: Upload web HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-web
          path: playwright-report/
          retention-days: 14
      - name: Upload Allure results
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: allure-results-web
          path: allure-results/
          retention-days: 14

  quality-gate:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, security, api, web]
    steps:
      - run: echo "All quality gates passed ✅"
```

- [ ] **Step 2: Validate the YAML parses**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!s.includes('quality-gate'))throw new Error('missing gate');console.log('ci.yml ok,',s.split('\n').length,'lines')"`
Expected: prints "ci.yml ok, N lines".

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: gated pipeline (lint/typecheck/security/api/web -> quality-gate)"
```

---

### Task 6: README badge + branch-protection docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the badge directly under the H1 title**

Insert after the first `# playwright-automationexercise` line:

```markdown

[![CI](https://github.com/kittiuchgolf/playwright-automation-exercise/actions/workflows/ci.yml/badge.svg)](https://github.com/kittiuchgolf/playwright-automation-exercise/actions/workflows/ci.yml)
```

- [ ] **Step 2: Add a "Quality gates" section before the "## CI" section**

```markdown
## Quality gates

CI runs six jobs; a final `quality-gate` job depends on all of them and is the
single status check to require for merges:

| Job | Gate |
|-----|------|
| `lint` | ESLint + Prettier (`npm run lint`, `npm run format:check`) |
| `typecheck` | `tsc --noEmit` |
| `security` | `npm audit --audit-level=high` |
| `api` / `web` | Playwright suites (with step-summary + artifacts) |
| `quality-gate` | passes only if all the above pass |

**Enable merge protection (manual, one-time):** repo **Settings → Branches →
Add branch ruleset** for `master` → enable **Require status checks to pass** →
select **`quality-gate`**. Optionally require a PR before merging.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add CI badge and quality-gate / branch-protection notes"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run every gate locally**

Run: `npm run lint && npm run format:check && npm run typecheck`
Expected: all three exit 0.

- [ ] **Step 2: Security gate**

Run: `npm audit --audit-level=high`
Expected: exit 0 (no high/critical advisories). If it reports a high vuln from
the new tooling, run `npm audit fix` (non-breaking) and re-check; if it cannot be
fixed without a breaking change, note it and discuss before downgrading the gate.

- [ ] **Step 3: API suite + summary smoke**

Run:
```bash
CI=true npx playwright test --project=api
GITHUB_STEP_SUMMARY=/tmp/s.md node scripts/ci-summary.mjs api && cat /tmp/s.md
```
Expected: 11 passed; table shows 11/11.

- [ ] **Step 4: Confirm no stray `results.json` is tracked**

Run: `git status --short`
Expected: clean (results.json is gitignored).

---

## Self-Review

- **Spec coverage:** §2 pipeline → Task 5. §3 jobs → Task 5. §4 hardening
  (concurrency/permissions) → Task 5. §5 reporting (reporters/summary/badge/
  gitignore) → Tasks 3,4,6. §6 tooling/config → Task 1. §7 make code pass →
  Task 2. §8 branch-protection docs → Task 6. §10 verification → Task 7. No gaps.
- **Placeholder scan:** none — all files have complete content; commands have
  expected output.
- **Type/name consistency:** `results.json`, `ci-summary.mjs` arg = project
  name (`api`/`web`), `quality-gate` job name, and the `lint`/`format:check`/
  `typecheck` scripts are used consistently across Tasks 1–7. Artifact names are
  unique per job (`-api` / `-web`) as Actions v4 requires.

## Out of scope (per spec, YAGNI)
CodeQL, GitHub Pages publishing, cross-browser matrix, nightly cron, Datadog.
