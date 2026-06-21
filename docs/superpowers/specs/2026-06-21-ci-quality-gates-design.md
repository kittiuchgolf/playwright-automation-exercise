# Design: CI Quality Gates (free, private-repo compatible)

- **Date:** 2026-06-21
- **Status:** Approved (design gate)
- **Scope:** Enhance `.github/workflows/ci.yml` and add supporting lint/format
  config so the pipeline showcases real CI/CD quality gates — all free, no paid
  accounts, working on a private repo.

## 1. Goal

Replace the single-job CI workflow with a multi-job pipeline that gates merges:
parallel quality + test jobs feeding one aggregation job that branch protection
can require. Add reporting niceties (annotations, step-summary table, badge).
No Datadog / paid services (dropped — the original request, infeasible for free).

## 2. Pipeline shape

```
 lint ─┐
 typecheck ─┤
 security ─┼──► quality-gate   (needs: all; the single required check)
 api ─┤
 web ─┘
```

- `lint`, `typecheck`, `security`, `api`, `web` run in parallel.
- `quality-gate` has `needs: [lint, typecheck, security, api, web]` and only
  succeeds if all succeed. It is the job to mark "required" in branch protection.

## 3. Jobs

| Job | Steps | Notes |
|-----|-------|-------|
| `lint` | checkout → setup-node 20 (npm cache) → `npm ci` → `npm run lint` → `npm run format:check` | ESLint + Prettier check; no browser |
| `typecheck` | checkout → node → `npm ci` → `npm run typecheck` | `tsc --noEmit`; no browser |
| `security` | checkout → node → `npm ci` → `npm audit --audit-level=high` | free dependency-vuln gate |
| `api` | node → `npm ci` → `npx playwright test --project=api` → summary → upload artifacts | **no browser install** (API project needs none) |
| `web` | node → `npm ci` → `npx playwright install --with-deps chromium` → `npx playwright test --project=web` → summary → upload artifacts | |
| `quality-gate` | `needs:` all above → echo success | required status check |

Test jobs run the summary step with `if: always()` and keep the existing HTML +
Allure artifact uploads (`if: ${{ !cancelled() }}`).

## 4. Workflow-level settings

- `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` —
  cancel superseded runs on the same ref.
- `permissions: { contents: read }` — least-privilege token. (Playwright's
  `github` reporter emits annotations via stdout workflow commands, which need
  no extra token scope.)
- Triggers unchanged: `push` (main/master), `pull_request`, `workflow_dispatch`.

## 5. Reporting (from Approach A)

- `playwright.config.ts`: on CI, append `['github']` (inline annotations) and
  `['json', { outputFile: 'results.json' }]` to the existing `list` + `html` +
  `allure-playwright` reporters.
- `scripts/ci-summary.mjs`: dependency-free Node script. Reads `results.json`,
  writes a Markdown table (total / passed / failed / flaky / skipped / duration)
  plus any failed-test names to `$GITHUB_STEP_SUMMARY`. Takes the project name
  as an argument for the heading. No-ops gracefully if `results.json` is missing.
- README: add a CI status badge at the top.
- `.gitignore`: add `results.json`.

## 6. New tooling/config

- `eslint.config.js` — flat config using `@eslint/js` + `typescript-eslint`
  recommended, applied to `src/**` and `tests/**`, ignoring `node_modules`,
  reports, and build output. `eslint-config-prettier` last to disable
  formatting rules that conflict with Prettier.
- `.prettierrc.json` — minimal (singleQuote, semicolons, printWidth 100,
  trailingComma all).
- `.prettierignore` — node_modules, reports, results.json, package-lock.json.
- `package.json` scripts: `lint` (`eslint .`), `lint:fix` (`eslint . --fix`),
  `format` (`prettier --write .`), `format:check` (`prettier --check .`).
- dev deps: `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`,
  `eslint-config-prettier`.

## 7. Make existing code pass the new gates

After adding ESLint/Prettier, run `npm run lint` and `npm run format:check`
locally and fix all findings (auto-fix where possible) so the gates are green on
the first CI run. This is part of the work, not a follow-up.

## 8. Branch protection (manual; documented, not automated)

A workflow file cannot enable branch protection. Document in the README the
exact steps: repo Settings → Branches → add rule for `master` → "Require status
checks to pass" → select `quality-gate`. Optionally automatable later via `gh`
or the REST API once `gh` is installed.

## 9. Out of scope (YAGNI)

- CodeQL / SAST (needs GitHub Advanced Security = paid on private repos).
- GitHub Pages report publishing (needs public repo or paid plan).
- Cross-browser matrix and nightly cron (Approach C — not chosen).
- Datadog / any paid observability.

## 10. Verification

- `npm run lint`, `npm run format:check`, `npm run typecheck` pass locally.
- `npm run test:api` and `npm run test:web` still pass (unchanged behavior).
- `node scripts/ci-summary.mjs web` against a real `results.json` writes a
  sensible Markdown table (validated by pointing `GITHUB_STEP_SUMMARY` at a temp
  file locally).
- YAML validity of `ci.yml` confirmed.
