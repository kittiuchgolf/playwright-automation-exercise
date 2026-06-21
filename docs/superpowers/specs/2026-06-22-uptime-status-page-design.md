# Design: Uptime / Status Page (monitoring dashboard — sub-project 2)

- **Date:** 2026-06-22
- **Status:** Approved (design gate)
- **Builds on:** the test-health dashboard (sub-project 1) already live on the
  `gh-pages` branch at `/` and `/allure/`.

## 1. Goal

Add a free, GitHub-native **uptime/status page** at `/status/` on the existing
Pages site. A scheduled workflow probes automationexercise.com and a safe subset
of its APIs every 6 hours, records up/down + response time, and renders a status
page with per-target status, response time, uptime %, and a recent timeline.
History persists in the `gh-pages` branch and accumulates over time.

## 2. Probe targets (safe, read-only)

One attempt per target per check (records the true state; no retry-masking).

| Target key | Method | URL | "Up" means |
|---|---|---|---|
| `homepage` | GET | `/` | HTTP 200 |
| `productsList` | GET | `/api/productsList` | HTTP 200 and `body.responseCode === 200` |
| `brandsList` | GET | `/api/brandsList` | HTTP 200 and `body.responseCode === 200` |
| `searchProduct` | POST | `/api/searchProduct` (form `search_product=top`) | `body.responseCode === 200` |
| `verifyLogin` | POST | `/api/verifyLogin` (bogus creds) | `body.responseCode === 404` ("User not found!") |

The mutating account endpoints (create/update/delete) are intentionally
**excluded** so probing never pollutes the shared site.

## 3. Components

### 3.1 `scripts/uptime-probe.mjs` (dependency-free, Node 20 global `fetch`)
- Holds the target list (key, method, url, body, expectation function).
- For each target: time the request, evaluate the expectation, produce
  `{ ok: boolean, ms: number, code: number | null }` (`code` = HTTP status, or the
  body `responseCode` for API targets; `null` if the request threw).
- Reads the existing history file (path via `--history` / arg; empty if missing),
  appends a new check `{ t: ISO8601, results: { [key]: {ok, ms, code} } }`,
  caps to the most recent **120** checks (~30 days at 6h), and writes the merged
  history to the output path (`--out`).
- Runnable locally for verification (`node scripts/uptime-probe.mjs --out /tmp/h.json`).

### 3.2 `.github/workflows/uptime.yml`
- Triggers: `schedule: cron '0 */6 * * *'` + `workflow_dispatch`.
- `permissions: contents: write`.
- `concurrency: { group: uptime, cancel-in-progress: false }` (don't drop a check).
- Steps:
  1. `actions/checkout@v4` (repo — for the probe script + status page template).
  2. `actions/setup-node@v4` (node 20). No `npm ci` needed (probe has no deps).
  3. `actions/checkout@v4` `ref: gh-pages` `path: gh-pages` (`continue-on-error: true`)
     — to read the existing `status/history.json`.
  4. Run probe: read `gh-pages/status/history.json` → append → write
     `public/status/history.json`; also copy `site/status/index.html` →
     `public/status/index.html`.
  5. `peaceiris/actions-gh-pages@v4` deploy `public/` to `gh-pages` with
     `keep_files: true` (preserves `/index.html` + `/allure/`).

### 3.3 `site/status/index.html` (self-contained, dark theme matching landing)
- Client-side: `fetch('./history.json')`, then render:
  - Per target: ● up / ● down (latest check), last response time (ms), uptime %
    over the loaded window.
  - A timeline strip of the last N checks per target (green/red bars).
  - "Last checked" timestamp + a note that checks run every 6h.
- Graceful empty state if `history.json` is missing or has no checks yet.

### 3.4 `site/index.html` (landing) — activate the status card
- Remove the `soon` styling / "Coming soon" tag; make the card a live link to
  `./status/`.

### 3.5 `README.md`
- Under the Monitoring dashboard section, add the `/status/` URL and a one-line
  description (probed every 6h, history in `gh-pages`).

## 4. Data shape (`status/history.json`)

```json
{
  "targets": ["homepage", "productsList", "brandsList", "searchProduct", "verifyLogin"],
  "checks": [
    {
      "t": "2026-06-22T00:00:00.000Z",
      "results": {
        "homepage": { "ok": true, "ms": 210, "code": 200 },
        "productsList": { "ok": true, "ms": 142, "code": 200 },
        "brandsList": { "ok": true, "ms": 118, "code": 200 },
        "searchProduct": { "ok": true, "ms": 190, "code": 200 },
        "verifyLogin": { "ok": true, "ms": 160, "code": 404 }
      }
    }
  ]
}
```

`targets` is rewritten each run from the script's canonical list (so adding a
target later just starts populating it). `uptime %` per target = `ok` count /
total checks present for that target, over the loaded window.

## 5. Coexistence & persistence

- **Separate workflow**, separate trigger: `uptime.yml` (cron) is independent of
  `ci.yml` (push/PR). They never run the same code.
- **`gh-pages` is the durable store.** Each run reads prior history from the
  branch and writes it back — git is the database (same model as Allure history).
- **`keep_files: true`** on every deploy means `/status/` and `/allure/` only add
  / update their own paths and never delete each other's files.
- No Pages-source change (already serving `gh-pages`), no external services, no
  secrets beyond the default `GITHUB_TOKEN`.

## 6. Risks & notes

- GitHub `schedule` is best-effort; the 6h cadence may drift or occasionally
  skip under load. Acceptable for this use.
- A transient site blip during a check records one "down" point for that target
  — honest, by design (no retry-masking).
- First run starts with an empty history; the page shows a friendly empty state
  until the first check lands.

## 7. Out of scope (YAGNI — declined during brainstorming)

- Auto-opening/closing GitHub Issues on downtime (incident log).
- shields.io README status badges.
- Probing the mutating account endpoints.
- Alerting/notifications (email/Slack).

## 8. Verification

- Local: `node scripts/uptime-probe.mjs --out /tmp/h.json` produces valid history
  against the live site; open `site/status/index.html` with that data to confirm
  rendering.
- Lint/format/typecheck stay green (the `.mjs` is linted; HTML is not type-checked).
- YAML validity of `uptime.yml` confirmed.
- End-to-end deploy proves out on the first scheduled / manually-dispatched run
  (writes `/status/` to `gh-pages` without disturbing `/allure/`).
