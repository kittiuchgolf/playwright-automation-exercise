# Uptime / Status Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a free, GitHub-native uptime/status page at `/status/` that probes automationexercise.com + a safe API subset every 6 hours, persists history on `gh-pages`, and renders per-target status / response time / uptime % / timeline.

**Architecture:** A dependency-free Node probe script (Node 20 `fetch`) appends results to a rolling `status/history.json`. A scheduled `uptime.yml` workflow reads prior history from `gh-pages`, runs the probe, and redeploys `/status/` with `keep_files: true` (never touching `/allure/`). A static `site/status/index.html` renders the history client-side.

**Tech Stack:** Node 20 (ESM, global fetch), GitHub Actions (cron), peaceiris/actions-gh-pages, static HTML/CSS/JS.

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/uptime-probe.mjs` (new) | Probe targets, merge into rolling history JSON |
| `site/status/index.html` (new) | Static status page; renders `history.json` client-side |
| `site/index.html` (modify) | Activate the "Uptime status" landing card |
| `.github/workflows/uptime.yml` (new) | Cron workflow: probe → deploy `/status/` |
| `README.md` (modify) | Document the status page |

---

### Task 1: Uptime probe script

**Files:**
- Create: `scripts/uptime-probe.mjs`

- [ ] **Step 1: Create `scripts/uptime-probe.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'https://automationexercise.com';
const MAX_CHECKS = 120;

// Each target: a key, how to probe it, and what "up" means.
const TARGETS = [
  { key: 'homepage', run: () => probe('GET', '/'), ok: (r) => r.status === 200 },
  {
    key: 'productsList',
    run: () => probe('GET', '/api/productsList'),
    ok: (r) => r.status === 200 && r.responseCode === 200,
  },
  {
    key: 'brandsList',
    run: () => probe('GET', '/api/brandsList'),
    ok: (r) => r.status === 200 && r.responseCode === 200,
  },
  {
    key: 'searchProduct',
    run: () => probe('POST', '/api/searchProduct', { search_product: 'top' }),
    ok: (r) => r.responseCode === 200,
  },
  {
    key: 'verifyLogin',
    // Bogus creds on purpose: read-only liveness check, expects "User not found!".
    run: () => probe('POST', '/api/verifyLogin', { email: 'nope@nope.test', password: 'x' }),
    ok: (r) => r.responseCode === 404,
  },
];

async function probe(method, p, form) {
  const start = Date.now();
  const init = { method, redirect: 'manual' };
  if (form) {
    init.body = new URLSearchParams(form).toString();
    init.headers = { 'content-type': 'application/x-www-form-urlencoded' };
  }
  try {
    const res = await fetch(BASE + p, init);
    const ms = Date.now() - start;
    let responseCode = null;
    if (p.startsWith('/api/')) {
      const body = await res.json().catch(() => null);
      if (body && typeof body.responseCode === 'number') responseCode = body.responseCode;
    } else {
      await res.text().catch(() => undefined);
    }
    return { status: res.status, responseCode, ms };
  } catch {
    return { status: 0, responseCode: null, ms: Date.now() - start };
  }
}

function argVal(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function readHistory(p) {
  if (p && fs.existsSync(p)) {
    try {
      const h = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(h.checks)) return h;
    } catch {
      /* corrupt/empty -> start fresh */
    }
  }
  return { targets: [], checks: [] };
}

async function main() {
  const outPath = argVal('--out');
  if (!outPath) {
    console.error('usage: node scripts/uptime-probe.mjs [--history <in.json>] --out <out.json>');
    process.exit(1);
  }

  const results = {};
  for (const t of TARGETS) {
    const r = await t.run();
    results[t.key] = { ok: t.ok(r), ms: r.ms, code: r.responseCode ?? r.status };
  }

  const history = readHistory(argVal('--history'));
  history.targets = TARGETS.map((t) => t.key);
  history.checks.push({ t: new Date().toISOString(), results });
  history.checks = history.checks.slice(-MAX_CHECKS);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(history, null, 2)}\n`);

  const up = Object.values(results).filter((r) => r.ok).length;
  console.log(`uptime check: ${up}/${TARGETS.length} up -> ${outPath}`);
}

main();
```

- [ ] **Step 2: Lint + format the script**

Run: `npm run lint && npm run format:check`
Expected: PASS. (If `format:check` flags it, run `npm run format`. If ESLint flags `fetch`/`URLSearchParams` as undefined, add them: in `eslint.config.js`, the `files: ['**/*.{js,mjs,cjs}']` block already sets `globals: globals.node` — confirm `globals` is recent enough to include `fetch`; it is in `^15.14.0`.)

- [ ] **Step 3: Run against the live site to verify output**

Run:
```bash
node scripts/uptime-probe.mjs --out /tmp/uptime.json
cat /tmp/uptime.json
```
Expected: prints `uptime check: N/5 up`, and `/tmp/uptime.json` contains `targets` (5 keys) + one entry in `checks` with `results` for each target (`{ok, ms, code}`).

- [ ] **Step 4: Verify append + cap works (run twice)**

Run:
```bash
node scripts/uptime-probe.mjs --history /tmp/uptime.json --out /tmp/uptime.json
node -e "console.log('checks:', JSON.parse(require('fs').readFileSync('/tmp/uptime.json')).checks.length)"
```
Expected: `checks: 2` (appended, not overwritten).

- [ ] **Step 5: Commit**

```bash
git add scripts/uptime-probe.mjs
git commit -m "feat: add dependency-free uptime probe script"
```

---

### Task 2: Status page

**Files:**
- Create: `site/status/index.html`

- [ ] **Step 1: Create `site/status/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Uptime status · playwright-automationexercise</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #0f172a;
        --card: #1e293b;
        --text: #e2e8f0;
        --muted: #94a3b8;
        --accent: #38bdf8;
        --border: #334155;
        --up: #22c55e;
        --down: #ef4444;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
        padding: 2rem;
        display: flex;
        justify-content: center;
      }
      .wrap {
        width: 100%;
        max-width: 820px;
      }
      a.back {
        color: var(--accent);
        text-decoration: none;
        font-size: 0.9rem;
      }
      h1 {
        margin: 0.5rem 0 0.25rem;
        font-size: 1.6rem;
      }
      p.sub {
        margin: 0 0 1.5rem;
        color: var(--muted);
      }
      .row {
        display: grid;
        grid-template-columns: 1.4fr auto auto;
        gap: 1rem;
        align-items: center;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.9rem 1.2rem;
        margin-bottom: 0.75rem;
      }
      .name {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 600;
      }
      .dot {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 50%;
      }
      .dot.up {
        background: var(--up);
      }
      .dot.down {
        background: var(--down);
      }
      .meta {
        color: var(--muted);
        font-size: 0.9rem;
        text-align: right;
      }
      .pct {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        color: var(--text);
      }
      .timeline {
        grid-column: 1 / -1;
        display: flex;
        gap: 2px;
        margin-top: 0.6rem;
      }
      .bar {
        flex: 1;
        height: 22px;
        border-radius: 2px;
        background: var(--border);
      }
      .bar.up {
        background: var(--up);
      }
      .bar.down {
        background: var(--down);
      }
      footer {
        margin-top: 1.5rem;
        color: var(--muted);
        font-size: 0.85rem;
      }
      .empty {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <a class="back" href="../">← back to dashboard</a>
      <h1>Uptime status</h1>
      <p class="sub">
        automationexercise.com health — checked every 6 hours. <span id="last"></span>
      </p>
      <div id="content"><div class="empty">Loading…</div></div>
      <footer>Data: <code>status/history.json</code> on the <code>gh-pages</code> branch.</footer>
    </main>
    <script>
      const LABELS = {
        homepage: "Homepage",
        productsList: "GET productsList",
        brandsList: "GET brandsList",
        searchProduct: "POST searchProduct",
        verifyLogin: "POST verifyLogin",
      };
      const TIMELINE = 40;

      function render(history) {
        const content = document.getElementById("content");
        const checks = history.checks || [];
        const targets = history.targets || [];
        if (!checks.length || !targets.length) {
          content.innerHTML =
            '<div class="empty">No checks recorded yet. The first scheduled run will populate this page.</div>';
          return;
        }
        document.getElementById("last").textContent =
          "Last checked: " + new Date(checks[checks.length - 1].t).toLocaleString();

        content.innerHTML = targets
          .map((key) => {
            const series = checks.map((c) => c.results[key]).filter(Boolean);
            const total = series.length;
            const ups = series.filter((r) => r.ok).length;
            const pct = total ? ((ups / total) * 100).toFixed(1) : "—";
            const latest = series[series.length - 1] || { ok: false, ms: 0 };
            const bars = series
              .slice(-TIMELINE)
              .map(
                (r) =>
                  '<div class="bar ' + (r.ok ? "up" : "down") + '" title="' + r.ms + 'ms"></div>',
              )
              .join("");
            return (
              '<div class="row">' +
              '<div class="name"><span class="dot ' +
              (latest.ok ? "up" : "down") +
              '"></span>' +
              (LABELS[key] || key) +
              "</div>" +
              '<div class="meta">' +
              (latest.ok ? latest.ms + " ms" : "down") +
              "</div>" +
              '<div class="meta pct">' +
              pct +
              "%</div>" +
              '<div class="timeline">' +
              bars +
              "</div>" +
              "</div>"
            );
          })
          .join("");
      }

      fetch("./history.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { targets: [], checks: [] }))
        .then(render)
        .catch(() => render({ targets: [], checks: [] }));
    </script>
  </body>
</html>
```

- [ ] **Step 2: Format**

Run: `npm run format && npm run format:check`
Expected: PASS (Prettier may reflow the inline HTML/JS — that's fine).

- [ ] **Step 3: Verify it renders with real data**

Run:
```bash
cp /tmp/uptime.json site/status/history.json
( cd site && python3 -m http.server 8099 >/dev/null 2>&1 & echo $! > /tmp/srv.pid )
sleep 1
curl -s -o /dev/null -w "status page: HTTP %{http_code}\n" http://localhost:8099/status/
kill "$(cat /tmp/srv.pid)" 2>/dev/null
rm -f site/status/history.json
```
Expected: `status page: HTTP 200`. (Optional: open `http://localhost:8099/status/` in a browser to eyeball the rows/timeline before killing the server.)

- [ ] **Step 4: Confirm no stray data file is staged**

Run: `git status --short site/`
Expected: only `site/status/index.html` is new; no `history.json` (it was removed; it is generated at deploy time, not committed).

- [ ] **Step 5: Commit**

```bash
git add site/status/index.html
git commit -m "feat: add uptime status page (renders history.json)"
```

---

### Task 3: Activate the landing-page status card

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1: Read the current status card**

Run: `grep -n "Uptime status" site/index.html`
Expected: finds the `<a class="card soon" href="./status/">` block. (Read the file to get the exact current wording — Prettier may have reflowed the `<p>`.)

- [ ] **Step 2: Replace the card with a live version**

Change the status card from the "coming soon" form to a live link. Old:

```html
      <a class="card soon" href="./status/">
        <h2>Uptime status <span class="tag soon">Coming soon</span></h2>
        <p>
          Scheduled health checks of automationexercise.com and its 14 APIs, with response times and
          incident history.
        </p>
      </a>
```

New:

```html
      <a class="card" href="./status/">
        <h2>Uptime status <span class="tag live">Live</span></h2>
        <p>
          Scheduled health checks of automationexercise.com and its key APIs every 6 hours —
          response times, uptime %, and a recent timeline.
        </p>
      </a>
```

(Removing the `soon` class re-enables the link; switching the tag to `live` reuses the existing `.tag.live` style.)

- [ ] **Step 3: Format + verify**

Run: `npm run format && npm run format:check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add site/index.html
git commit -m "feat: activate uptime status card on the landing page"
```

---

### Task 4: Scheduled uptime workflow

**Files:**
- Create: `.github/workflows/uptime.yml`

- [ ] **Step 1: Create `.github/workflows/uptime.yml`**

```yaml
name: Uptime

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: uptime
  cancel-in-progress: false

jobs:
  probe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Load existing history
        uses: actions/checkout@v4
        continue-on-error: true
        with:
          ref: gh-pages
          path: gh-pages
      - name: Run uptime probe
        run: |
          mkdir -p public/status
          node scripts/uptime-probe.mjs \
            --history gh-pages/status/history.json \
            --out public/status/history.json
          cp site/status/index.html public/status/index.html
      - name: Deploy /status to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: public
          keep_files: true
```

- [ ] **Step 2: Format + validate YAML**

Run: `npm run format && npm run format:check`
Then: `node -e "require('fs').readFileSync('.github/workflows/uptime.yml','utf8').includes('cron') || process.exit(1); console.log('uptime.yml ok')"`
Expected: format passes; prints `uptime.yml ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/uptime.yml
git commit -m "ci: add scheduled uptime workflow (every 6h)"
```

---

### Task 5: Document the status page

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the Monitoring dashboard section**

In `README.md`, find the site-structure block under "## Monitoring dashboard" and replace the `status/` line so it is no longer "coming soon". Old line:

```
  └── status/       uptime status page (sub-project 2 — coming soon)
```

New line:

```
  └── status/       uptime status page (probed every 6h; history in gh-pages)
```

Then, immediately after that code block, add:

```markdown
An **Uptime** workflow (`.github/workflows/uptime.yml`) probes the site + key
APIs every 6 hours and publishes `/status/` with response times, uptime %, and a
recent timeline — history persists in `gh-pages`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document the uptime status page"
```

---

### Task 6: Final verification

- [ ] **Step 1: All gates**

Run: `npm run lint && npm run format:check && npm run typecheck`
Expected: all exit 0.

- [ ] **Step 2: Probe end-to-end once more (fresh)**

Run:
```bash
rm -f /tmp/uptime2.json
node scripts/uptime-probe.mjs --out /tmp/uptime2.json
node -e "const h=require('/tmp/uptime2.json'); if(h.targets.length!==5) throw new Error('targets'); if(h.checks.length!==1) throw new Error('checks'); console.log('probe schema OK:', JSON.stringify(h.checks[0].results.homepage))"
```
Expected: prints `probe schema OK: {...homepage...}`.

- [ ] **Step 3: Confirm working tree is clean of generated data**

Run: `git status --short`
Expected: clean (no `history.json` tracked anywhere; `site/allure/` and `results.json` already gitignored).

---

## Self-Review

- **Spec coverage:** §2 targets → Task 1 (`TARGETS`). §3.1 probe script → Task 1. §3.2 workflow → Task 4. §3.3 status page → Task 2. §3.4 landing card → Task 3. §3.5 README → Task 5. §4 data shape → Task 1 (`{targets, checks:[{t,results}]}`) + Task 2 reads it. §5 coexistence (`keep_files`) → Task 4. §8 verification → Tasks 1,2,6. No gaps.
- **Placeholder scan:** none — every file has complete content; commands have expected output.
- **Name/shape consistency:** the 5 target keys (`homepage`, `productsList`, `brandsList`, `searchProduct`, `verifyLogin`) and the record shape `{ok, ms, code}` + history `{targets, checks:[{t, results}]}` are identical across the probe (Task 1), the page renderer (Task 2), and the workflow paths (`public/status/history.json`, Task 4). `LABELS` in Task 2 covers exactly those 5 keys.

## Out of scope (per spec, YAGNI)
Downtime GitHub-issues, shields.io badges, probing mutating account endpoints, alerting.
