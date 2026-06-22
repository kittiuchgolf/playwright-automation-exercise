# Cross-Browser + Mobile + Accessibility Coverage — Design

**Date:** 2026-06-22
**Status:** Approved (design)
**Goal context:** Portfolio / job-hunt. This work expands the project's
demonstrable QA breadth (cross-browser, mobile, accessibility) and showcases
the baseline-diff pattern. Operational value is secondary because the target
site (`automationexercise.com`) is third-party and not under our control.

## Problem

The suite currently runs **Desktop Chrome only**. Playwright's core strength —
multi-engine + mobile coverage — is unused, and there is no accessibility
signal at all. For a portfolio piece aimed at QA automation roles, these are
the highest-value, lowest-effort gaps to close.

## Goals

- Run the existing web specs across Chromium, Firefox, WebKit, and two
  emulated mobile devices.
- Keep PR/push CI fast and stable (Chromium only); run the full matrix on a
  schedule.
- Add accessibility scanning (axe) on key pages as a **report-only** signal
  with a committed baseline that flags only *new* violations.
- Respect the documented constraint: do not overload the shared, live target
  site with concurrent sessions.

## Non-Goals (v1)

- Visual regression testing (flaky against a live ad-serving site).
- Real mobile devices / device farm (emulation only).
- Accessibility scanning of the checkout page (requires auth + cart state).
- CI sharding (premature at current test count).
- Publishing the nightly matrix results to GitHub Pages.
- Failing CI on accessibility violations (we cannot fix a third-party site).
- Dockerization (planned as the next, separate spec).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Matrix wiring | Playwright projects + `FULL_MATRIX` env flag | Idiomatic; one runner; keeps load capped. Rejected GitHub Actions matrix fan-out because parallel runners hammer the shared site simultaneously. |
| When full matrix runs | PR/push = Chromium; nightly = all engines | Keeps PRs fast/stable; full coverage on schedule. |
| Mobile | Emulation (`Pixel 5`, `iPhone 13`) | No device farm available; only realistic option. |
| a11y enforcement | Report-only + committed baseline | We do not own the target site and cannot fix its violations; gating would keep CI permanently red. |
| a11y granularity | Rule-id level (not DOM node) | Cheap canary for v1; node-level fingerprinting is a future upgrade. |
| a11y engine | Chromium only | axe results are engine-independent; no need to run ×5. |

## Architecture

### 1. Browser/device projects — `playwright.config.ts`

Replace the single `web` project with an engine set gated by a `FULL_MATRIX`
env flag. Existing specs and `testDir` are unchanged; all current web tests run
on every selected engine automatically.

```ts
const FULL = !!process.env.FULL_MATRIX;   // nightly sets this
const IGNORE_A11Y = /a11y\.spec\.ts/;     // a11y runs only in its own project

const webProjects = [
  { name: 'web', testIgnore: IGNORE_A11Y, use: { ...devices['Desktop Chrome'],  baseURL: BASE_URL } },
  ...(FULL ? [
    { name: 'web-firefox',       testIgnore: IGNORE_A11Y, use: { ...devices['Desktop Firefox'], baseURL: BASE_URL } },
    { name: 'web-webkit',        testIgnore: IGNORE_A11Y, use: { ...devices['Desktop Safari'],  baseURL: BASE_URL } },
    { name: 'web-mobile',        testIgnore: IGNORE_A11Y, use: { ...devices['Pixel 5'],         baseURL: BASE_URL } },
    { name: 'web-mobile-safari', testIgnore: IGNORE_A11Y, use: { ...devices['iPhone 13'],       baseURL: BASE_URL } },
  ] : []),
];

// Dedicated Chromium-only project for the a11y scan (axe is engine-independent).
const a11yProject = {
  name: 'a11y',
  testMatch: IGNORE_A11Y,
  use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
};
```

- PR/local default = `web` + `api` (today's behavior, same speed).
- `FULL_MATRIX=1` = all 5 web projects + `api`. The `a11y` project runs only
  via `--project=a11y` (CI a11y job / `npm run test:a11y`), so it never
  multiplies across engines.
- CI `workers` stays at 2 → live-site load respected.

**Expected outcome:** the first full-matrix run will surface real
cross-browser/mobile failures (hover-only menus, viewport-hidden elements,
WebKit selector differences). These are fixed per-failure in the page objects;
no redesign of the POM is implied.

### 2. Accessibility suite — `tests/web/a11y.spec.ts`

New dev dependency: `@axe-core/playwright`. Dedicated spec run only under the
Chromium-only `a11y` project (`--project=a11y`); excluded from all `web*`
projects via `testIgnore`.

```ts
const ROUTES = ['/', '/products', '/login', '/contact_us']; // + product-detail, cart via nav
for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']).analyze();
    await testInfo.attach('axe', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    writeResult(route, results.violations); // accumulate into a11y-results.json
    // No failing expect() — report-only.
  });
}
```

- Product-detail and cart pages are reached via existing page objects (a nav
  step), then scanned.
- Checkout is out of scope for v1.
- Each scan attaches full violation JSON to the Allure/HTML report and appends
  to `a11y-results.json` (`{ route -> [ruleId] }`).

### 3. Baseline + diff — non-gating

The baseline-diff pattern (same idea as visual-regression golden files, but the
"golden" artifact is a list of *expected/accepted* accessibility rule failures,
not pixels).

- **`docs/a11y-baseline.json`** — committed snapshot: `{ route -> [ruleId] }`.
  Seeded once from the site's current state. "Golden" = the exact set of
  failures present the day it was frozen (think `xfail`/known-issues list).
- **`scripts/a11y-diff.mjs`** — loads `a11y-results.json` and the baseline; for
  each route computes `new = current − baseline`; prints new rule ids to
  `$GITHUB_STEP_SUMMARY`. **Always exits 0** (never blocks merge).
- **Update flow:** `node scripts/a11y-diff.mjs --update` rewrites the baseline
  from the current scan; commit intentionally. Never auto-updates.

**Why freeze instead of an empty baseline:** an empty baseline reports every
site bug as "new" forever → noise → ignored. Freezing the site's existing
violations means only *change* lights up — which is usually our own broken test
navigation, i.e. a functional regression in disguise. That is the real signal.

**Known limit:** matching on rule id only. A new violation of an
already-baselined rule on a different element will not flag. Acceptable for a v1
canary.

### 4. CI changes

- **`.github/workflows/ci.yml` (per push/PR):**
  - Existing gates unchanged; `web` job stays Chromium-only.
  - Add a non-gating **`a11y`** job (Chromium): runs
    `playwright test --project=a11y`, then `a11y-diff.mjs`, posts new
    violations to the job summary.
  - The `a11y` job is **NOT** added to `quality-gate`'s needs list — it can
    never block a merge.
  - Browser install stays `chromium`.
- **`.github/workflows/nightly.yml` (new):**
  - Triggers: `schedule` (cron, ~daily) + `workflow_dispatch`.
  - Installs all engines: `npx playwright install --with-deps chromium firefox webkit`.
  - Runs `FULL_MATRIX=1 npm test`.
  - Uploads HTML + Allure artifacts. Does **not** publish to Pages (keeps the
    dashboard free of nightly cross-browser noise).

### 5. Reporting impact

Allure is already wired. a11y violation JSON appears as per-test attachments.
Cross-browser/mobile failures appear under their project names
(`web-firefox`, `web-mobile`, …) in reports, giving clear per-engine
visibility. The PR Pages-publish flow is unchanged.

## File Change List

| Action | File | Purpose |
|---|---|---|
| edit | `playwright.config.ts` | Engine projects + `FULL_MATRIX` flag |
| add  | `tests/web/a11y.spec.ts` | axe scan of key pages (report-only) |
| add  | `scripts/a11y-diff.mjs` | Baseline diff, prints new violations |
| add  | `docs/a11y-baseline.json` | Seeded golden violation snapshot |
| add  | `.github/workflows/nightly.yml` | Scheduled full-matrix run |
| edit | `.github/workflows/ci.yml` | Non-gating `a11y` job |
| edit | `package.json` | `@axe-core/playwright` dep; `test:a11y`, `a11y:baseline` scripts |
| edit | `README.md`, `CLAUDE.md` | Document matrix, a11y, nightly |

## Verification

- `npx playwright install firefox webkit` then `FULL_MATRIX=1 npm test` →
  all 5 web engines run.
- `npm run test:a11y` → produces `a11y-results.json` + Allure attachments,
  never red.
- `node scripts/a11y-diff.mjs` against a fresh seeded baseline → "no new
  violations".
- Confirm the PR `web` job remains Chromium-only (no PR runtime regression).

## Risks

- **Cross-browser failures in existing POM** — expected; fix per-failure, not a
  redesign. May be a meaningful first-run effort depending on selector quality.
- **Live-site flake amplified ×5** — mitigated by capped workers, retries, and
  running the full matrix only nightly.
- **a11y rule-id granularity** — coarse; documented as a known v1 limit.

## Follow-up (separate specs)

- Dockerization (next cycle).
- Optional: node-level a11y fingerprinting; checkout-page a11y; nightly trend
  dashboard.
