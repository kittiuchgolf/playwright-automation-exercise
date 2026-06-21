# playwright-automationexercise

[![CI](https://github.com/kittiuchgolf/playwright-automation-exercise/actions/workflows/ci.yml/badge.svg)](https://github.com/kittiuchgolf/playwright-automation-exercise/actions/workflows/ci.yml)

Playwright + TypeScript web & API automation for
[automationexercise.com](https://automationexercise.com).

📊 **Live dashboard:** https://kittiuchgolf.github.io/playwright-automation-exercise/

## Quick start
```bash
npm install
npx playwright install chromium
cp .env.example .env   # optional; defaults target the live site
npm test               # web + api
```

## Suites
- **Web** (`tests/web/`) — Page Object Model, 18 tests mapped to the site's
  official test cases (auth, products, cart, checkout, contact, misc).
- **API** (`tests/api/`) — all 14 endpoints; asserts on `body.responseCode`
  (every response is HTTP 200 — see `docs/api-notes.md`).

## Useful commands
| Command | Purpose |
|---|---|
| `npm run test:web` / `npm run test:api` | One suite |
| `npm run report` | Open HTML report |
| `npm run allure:generate && npm run allure:open` | Allure report |
| `npm run smoke` | Fast sanity check |
| `npm run typecheck` | Type check |

## Notes on reliability
Tests run against a live, shared public site. The config caps worker
parallelism and enables retries to absorb transient load/ad hiccups; point
`BASE_URL`/`API_URL` at a self-hosted instance for rock-solid runs. See
`CLAUDE.md` and `docs/architecture.md`.

## Docs
- `CLAUDE.md` — guide for Claude Code (commands, conventions, the API quirk).
- `docs/architecture.md` — layered design.
- `docs/api-notes.md` — endpoint table + the responseCode behavior.
- `docs/superpowers/` — design spec + implementation plan.

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

## Monitoring dashboard

On every push to `master`, the `pages` job publishes a combined **Allure
test-health report** (api + web) to GitHub Pages with trend history across the
last ~20 runs — pass/fail trends, flaky tests, and durations:

**https://kittiuchgolf.github.io/playwright-automation-exercise/**

```
<site root>/        landing page (index.html)
  └── allure/       Allure report (trends/history)
  └── status/       uptime status page (probed every 6h; history in gh-pages)
```

An **Uptime** workflow (`.github/workflows/uptime.yml`) probes the site + key
APIs every 6 hours and publishes `/status/` with response times, uptime %, and a
recent timeline — history persists in `gh-pages`.

**Enable Pages (manual, one-time):** repo **Settings → Pages → Build and
deployment → Source: Deploy from a branch → `gh-pages` / `(root)`**. The first
push to `master` after this creates the `gh-pages` branch automatically.

## CI
`.github/workflows/ci.yml` runs the gated pipeline headless on every push/PR,
writes a per-run results table to the job summary, and uploads the HTML +
Allure artifacts.
