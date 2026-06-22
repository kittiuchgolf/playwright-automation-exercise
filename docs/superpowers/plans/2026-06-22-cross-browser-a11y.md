# Cross-Browser + Mobile + Accessibility Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the existing web suite across Chromium/Firefox/WebKit + two emulated mobile devices (PR=Chromium, full matrix nightly), and add report-only accessibility scanning with a committed baseline-diff.

**Architecture:** Cross-browser is wired via Playwright *projects* gated by a `FULL_MATRIX` env flag (no GitHub Actions matrix fan-out, to keep concurrent load off the shared live site). Accessibility is a dedicated Chromium-only `a11y` project running `@axe-core/playwright`; each route writes a per-route JSON result, and a pure `diffViolations` function compares against a committed golden baseline, printing only *new* rule ids to the CI job summary. Nothing accessibility-related ever fails `quality-gate`.

**Tech Stack:** Playwright + TypeScript (ESM), `@axe-core/playwright`, Node built-in `node:test` (for the diff unit test), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-06-22-cross-browser-a11y-design.md`

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Modify | `playwright.config.ts` | Define engine projects + `FULL_MATRIX` flag + Chromium-only `a11y` project |
| Create | `tests/web/a11y.spec.ts` | axe scan of fixed routes; writes per-route result JSON; never fails |
| Create | `scripts/a11y-diff.mjs` | Pure `diffViolations()` + CLI: aggregate results, diff vs baseline, `--update` |
| Create | `scripts/a11y-diff.test.mjs` | `node:test` unit tests for `diffViolations()` |
| Create | `docs/a11y-baseline.json` | Golden snapshot of accepted violations `{ route -> [ruleId] }` |
| Create | `.github/workflows/nightly.yml` | Scheduled + manual full-matrix run, artifacts only |
| Modify | `.github/workflows/ci.yml` | Add non-gating `a11y` job (not in `quality-gate` needs) |
| Modify | `package.json` | `@axe-core/playwright` dev dep; `test:a11y`, `a11y:diff`, `a11y:baseline` scripts |
| Modify | `.gitignore` | Ignore `a11y-results/` |
| Modify | `README.md`, `CLAUDE.md` | Document matrix, a11y baseline flow, nightly |

**Routes scanned (v1):** `/`, `/products`, `/product_details/1`, `/view_cart`, `/login`, `/contact_us`. Scanned by direct `goto` (more robust than navigation for a canary; checkout excluded — needs auth + cart state).

---

## Task 1: Cross-browser + mobile projects in playwright.config.ts

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Replace the single `web` project with the engine set + a11y project**

Replace the entire `projects: [ ... ]` array (and add the two `const` declarations just above the `export default defineConfig({`) so the file's project section reads:

```ts
const FULL = !!process.env.FULL_MATRIX; // nightly sets this to run every engine
const IGNORE_A11Y = /a11y\.spec\.ts/; // a11y runs only in its own Chromium project

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: reporters,
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL },
    },
    {
      name: 'web',
      testDir: './tests/web',
      testIgnore: IGNORE_A11Y,
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
    ...(FULL
      ? [
          {
            name: 'web-firefox',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Desktop Firefox'], baseURL: BASE_URL },
          },
          {
            name: 'web-webkit',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Desktop Safari'], baseURL: BASE_URL },
          },
          {
            name: 'web-mobile',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Pixel 5'], baseURL: BASE_URL },
          },
          {
            name: 'web-mobile-safari',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['iPhone 13'], baseURL: BASE_URL },
          },
        ]
      : []),
    {
      name: 'a11y',
      testDir: './tests/web',
      testMatch: IGNORE_A11Y,
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
  ],
});
```

Leave the existing `BASE_URL`, `API_URL`, and `reporters` declarations at the top of the file unchanged.

- [ ] **Step 2: Verify default run lists Chromium web only (no matrix)**

Run: `npx playwright test --list --project=web`
Expected: lists the existing web specs (auth/cart/checkout/contact/home/misc/products) under project `web`, and does **not** list `a11y.spec.ts` (it doesn't exist yet, and is ignored anyway). No error.

- [ ] **Step 3: Verify the full matrix only appears with the flag**

Run: `FULL_MATRIX=1 npx playwright test --list --project=web-firefox --project=web-webkit --project=web-mobile --project=web-mobile-safari`
Expected: all four extra projects resolve (each repeats the web specs). Without `FULL_MATRIX`, the same command errors with "Project(s) ... not found" — confirming the gate works.

- [ ] **Step 4: Format + commit**

```bash
npm run format
git add playwright.config.ts
git commit -m "feat: add firefox/webkit/mobile projects gated by FULL_MATRIX"
```

---

## Task 2: Add the axe dependency

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install @axe-core/playwright**

Run: `npm install -D @axe-core/playwright`
Expected: adds `@axe-core/playwright` to `devDependencies`; lockfile updates.

- [ ] **Step 2: Verify it resolves**

Run: `node -e "import('@axe-core/playwright').then(m => console.log(typeof m.AxeBuilder))"`
Expected: prints `function`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add @axe-core/playwright dev dependency"
```

---

## Task 3: Accessibility spec (report-only)

**Files:**
- Create: `tests/web/a11y.spec.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Ignore the generated results dir**

Append a line to `.gitignore`:

```
a11y-results/
```

- [ ] **Step 2: Write the a11y spec**

Create `tests/web/a11y.spec.ts`:

```ts
import { test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

// Public pages reachable without auth/cart state. Checkout is intentionally
// excluded (needs a logged-in user + items in cart) — see the design spec.
const ROUTES = [
  '/',
  '/products',
  '/product_details/1',
  '/view_cart',
  '/login',
  '/contact_us',
];

const OUT_DIR = 'a11y-results';

const slug = (route: string) =>
  route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Full detail goes to the report for humans.
    await testInfo.attach('axe-violations', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    // Machine-readable per-route result for the baseline diff (rule ids only).
    const ids = [...new Set(results.violations.map((v) => v.id))].sort();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug(route)}.json`),
      JSON.stringify({ route, violations: ids }, null, 2),
    );

    // Report-only: no assertion that can fail the build.
  });
}
```

- [ ] **Step 3: Run the a11y project against the live site**

Run: `npx playwright test --project=a11y`
Expected: 6 tests, all PASS (report-only). Directory `a11y-results/` now holds `root.json`, `products.json`, `product_details-1.json`, `view_cart.json`, `login.json`, `contact_us.json`, each like `{ "route": "/products", "violations": ["color-contrast", ...] }`.

If a route flakes on the live site, re-run — retries are configured. A consistently failing *navigation* (not an axe result) is a real bug; debug the route.

- [ ] **Step 4: Commit**

```bash
npm run format
git add tests/web/a11y.spec.ts .gitignore
git commit -m "feat: add report-only axe accessibility scan of key pages"
```

---

## Task 4: Baseline diff script (TDD) + seed baseline

**Files:**
- Create: `scripts/a11y-diff.mjs`
- Create: `scripts/a11y-diff.test.mjs`
- Create: `docs/a11y-baseline.json`

- [ ] **Step 1: Write the failing unit test**

Create `scripts/a11y-diff.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffViolations } from './a11y-diff.mjs';

test('flags a rule id present now but absent from baseline', () => {
  const baseline = { '/': ['color-contrast', 'landmark-one-main'] };
  const current = { '/': ['color-contrast', 'landmark-one-main', 'button-name'] };
  assert.deepEqual(diffViolations(baseline, current), { '/': ['button-name'] });
});

test('reports an empty array when nothing is new', () => {
  const baseline = { '/products': ['image-alt'] };
  const current = { '/products': ['image-alt'] };
  assert.deepEqual(diffViolations(baseline, current), { '/products': [] });
});

test('treats every id on a brand-new route as new', () => {
  const baseline = {};
  const current = { '/login': ['color-contrast'] };
  assert.deepEqual(diffViolations(baseline, current), { '/login': ['color-contrast'] });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/a11y-diff.test.mjs`
Expected: FAIL — cannot find module `./a11y-diff.mjs` (or `diffViolations` is not a function).

- [ ] **Step 3: Implement the script**

Create `scripts/a11y-diff.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RESULTS_DIR = 'a11y-results';
const BASELINE_PATH = 'docs/a11y-baseline.json';

/**
 * Pure diff: for each route in `current`, return the rule ids not present in
 * that route's `baseline` entry. Always returns an entry per current route
 * (empty array when nothing is new).
 */
export function diffViolations(baseline, current) {
  const out = {};
  for (const [route, ids] of Object.entries(current)) {
    const known = new Set(baseline[route] ?? []);
    out[route] = ids.filter((id) => !known.has(id));
  }
  return out;
}

function readResultsDir(dir = RESULTS_DIR) {
  if (!fs.existsSync(dir)) return {};
  const map = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const { route, violations } = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    map[route] = [...violations].sort();
  }
  return map;
}

function readBaseline(p = BASELINE_PATH) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

function writeBaseline(map, p = BASELINE_PATH) {
  const sorted = Object.fromEntries(
    Object.keys(map)
      .sort()
      .map((route) => [route, [...map[route]].sort()]),
  );
  fs.writeFileSync(p, `${JSON.stringify(sorted, null, 2)}\n`);
}

function main() {
  const update = process.argv.includes('--update');
  const current = readResultsDir();

  if (update) {
    writeBaseline(current);
    console.log(`Updated baseline (${Object.keys(current).length} routes) at ${BASELINE_PATH}.`);
    return;
  }

  const newByRoute = diffViolations(readBaseline(), current);
  const routesWithNew = Object.entries(newByRoute).filter(([, ids]) => ids.length > 0);

  let md = '## ♿ Accessibility diff vs baseline\n\n';
  if (routesWithNew.length === 0) {
    md += 'No new violations. ✅\n';
  } else {
    md += '| Route | New rule ids |\n|---|---|\n';
    for (const [route, ids] of routesWithNew) md += `| \`${route}\` | ${ids.join(', ')} |\n`;
  }

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) fs.appendFileSync(summaryFile, `${md}\n`);
  else console.log(md);

  // Report-only: never fail the build.
  process.exit(0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/a11y-diff.test.mjs`
Expected: PASS — 3 tests, 0 failures.

- [ ] **Step 5: Seed the golden baseline from the live site's current state**

Requires `a11y-results/` from Task 3 (re-run `npx playwright test --project=a11y` first if it was cleaned).

Run: `node scripts/a11y-diff.mjs --update`
Expected: prints `Updated baseline (6 routes) at docs/a11y-baseline.json.` File now contains the current accepted violations per route.

- [ ] **Step 6: Verify a clean diff reports nothing new**

Run: `node scripts/a11y-diff.mjs`
Expected: prints the "No new violations. ✅" summary (baseline == current).

- [ ] **Step 7: Commit**

```bash
npm run format
git add scripts/a11y-diff.mjs scripts/a11y-diff.test.mjs docs/a11y-baseline.json
git commit -m "feat: add a11y baseline-diff script with unit tests and seed baseline"
```

---

## Task 5: npm scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the a11y scripts**

In the `"scripts"` block of `package.json`, add these three entries (after `"smoke"`):

```json
    "test:a11y": "playwright test --project=a11y",
    "a11y:diff": "node scripts/a11y-diff.mjs",
    "a11y:baseline": "node scripts/a11y-diff.mjs --update"
```

Ensure the preceding line keeps its trailing comma and the JSON stays valid.

- [ ] **Step 2: Verify the scripts run**

Run: `npm run test:a11y && npm run a11y:diff`
Expected: a11y project runs (6 PASS), then diff prints "No new violations. ✅".

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add test:a11y, a11y:diff, a11y:baseline npm scripts"
```

---

## Task 6: Non-gating a11y CI job

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the `a11y` job**

Insert this job after the `web:` job and before `quality-gate:` in `.github/workflows/ci.yml`:

```yaml
  a11y:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run accessibility scan (report-only)
        run: npx playwright test --project=a11y
        env:
          CI: 'true'
      - name: Diff vs baseline (never fails the build)
        if: always()
        run: node scripts/a11y-diff.mjs
      - name: Upload a11y results
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: a11y-results
          path: a11y-results/
          retention-days: 14
```

- [ ] **Step 2: Confirm `quality-gate` does NOT depend on it**

Verify the `quality-gate` job's `needs:` line remains exactly:

```yaml
    needs: [lint, typecheck, security, api, web]
```

The `a11y` job must be absent from that list so accessibility can never block a merge.

- [ ] **Step 3: Validate the workflow YAML parses**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!/^\s{2}a11y:/m.test(s))throw new Error('a11y job missing');if(/needs:\s*\[lint, typecheck, security, api, web\]/.test(s)===false)throw new Error('quality-gate needs changed');console.log('ci.yml OK')"`
Expected: prints `ci.yml OK`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add non-gating accessibility job with baseline diff"
```

---

## Task 7: Nightly full-matrix workflow

**Files:**
- Create: `.github/workflows/nightly.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/nightly.yml`:

```yaml
name: Nightly cross-browser

on:
  schedule:
    - cron: '0 3 * * *' # 03:00 UTC daily
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: nightly-${{ github.ref }}
  cancel-in-progress: true

jobs:
  full-matrix:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox webkit
      - name: Run full matrix (all engines + mobile + api)
        run: npm test
        env:
          CI: 'true'
          FULL_MATRIX: '1'
      - name: Test summary
        if: always()
        run: node scripts/ci-summary.mjs nightly
      - name: Upload HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-nightly
          path: playwright-report/
          retention-days: 14
      - name: Upload Allure results
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: allure-results-nightly
          path: allure-results/
          retention-days: 14
```

- [ ] **Step 2: Validate the workflow YAML parses**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/nightly.yml','utf8');if(!/FULL_MATRIX: '1'/.test(s))throw new Error('FULL_MATRIX not set');if(!/install --with-deps chromium firefox webkit/.test(s))throw new Error('engines not installed');console.log('nightly.yml OK')"`
Expected: prints `nightly.yml OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/nightly.yml
git commit -m "ci: add nightly full cross-browser + mobile matrix workflow"
```

---

## Task 8: Documentation

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Document the matrix + a11y in README.md**

Add a new section to `README.md` after the "Suites" section:

```markdown
## Cross-browser, mobile & accessibility

- **Per-PR CI** runs the web suite on **Chromium** only (fast, stable, light on
  the shared live site).
- **Nightly** (`.github/workflows/nightly.yml`, also `workflow_dispatch`) runs
  the full matrix — Chromium, Firefox, WebKit, plus emulated **Pixel 5** and
  **iPhone 13** — via `FULL_MATRIX=1 npm test`. Run it locally with:

  ```bash
  npx playwright install firefox webkit
  FULL_MATRIX=1 npm test
  ```

- **Accessibility** (`npm run test:a11y`) scans key pages with axe and is
  **report-only** — it never fails CI, because the target site is third-party
  and we cannot fix its violations. `npm run a11y:diff` flags only rule ids that
  are *new* versus the committed golden baseline (`docs/a11y-baseline.json`);
  refresh the baseline intentionally with `npm run a11y:baseline`.
```

- [ ] **Step 2: Document conventions in CLAUDE.md**

Add a new section to `CLAUDE.md` after the "Testing against a live, shared site" section:

```markdown
## Cross-browser matrix & accessibility

- Browser/device coverage is wired via **Playwright projects gated by
  `FULL_MATRIX`** in `playwright.config.ts` — NOT a GitHub Actions matrix
  (parallel runners would overload the shared live site). Default run = `web`
  (Chromium) + `api`; `FULL_MATRIX=1` adds `web-firefox`, `web-webkit`,
  `web-mobile`, `web-mobile-safari`.
- The `a11y` project is **Chromium-only** and excluded from the `web*` projects
  via `testIgnore`/`testMatch` on `/a11y\.spec\.ts/`. It is **report-only**:
  `tests/web/a11y.spec.ts` writes per-route rule ids to `a11y-results/`, and
  `scripts/a11y-diff.mjs` diffs them against `docs/a11y-baseline.json`. Never
  add a failing assertion to the a11y spec, and never add the `a11y` CI job to
  `quality-gate`'s `needs`.
- Update the a11y baseline only on purpose: `npm run a11y:baseline`, then commit
  the changed `docs/a11y-baseline.json`.
```

- [ ] **Step 3: Verify lint/format gates still pass**

Run: `npm run lint && npm run format:check`
Expected: both pass (no errors). If `format:check` fails, run `npm run format` and re-stage.

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: document cross-browser matrix and a11y baseline flow"
```

---

## Final Verification

- [ ] `npx playwright test --project=web --list` → web specs only, no a11y, no error.
- [ ] `FULL_MATRIX=1 npx playwright test --list` → api + web + 4 extra engines + a11y all resolve.
- [ ] `node --test scripts/a11y-diff.test.mjs` → 3 PASS.
- [ ] `npm run test:a11y && npm run a11y:diff` → 6 a11y tests pass; diff prints "No new violations. ✅".
- [ ] `npm run lint && npm run format:check` → pass.
- [ ] `grep -n "needs:" .github/workflows/ci.yml` → `quality-gate` needs unchanged (no `a11y`).
