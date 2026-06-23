# Required Merge Gate + Web Quarantine Lane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect `master` so changes land only via a PR with the `quality-gate` check green, while a non-blocking `web-quarantine` lane keeps flaky web tests running and visible without blocking merges.

**Architecture:** The single `web` CI job is split by Playwright tag — the blocking `web` job runs `--grep-invert @quarantine` (stable tests), and a new non-blocking `web-quarantine` job runs `--grep @quarantine` (flaky tests, report-only). `quality-gate`'s `needs` is unchanged, so only stable web tests gate merges. Branch protection is applied by a committed, idempotent `gh api` script.

**Tech Stack:** GitHub Actions, Playwright test tags (`--grep`/`--grep-invert`), `gh` CLI (`gh api`), bash.

**Spec:** `docs/superpowers/specs/2026-06-22-merge-gate-and-quarantine-design.md`

**Branch note:** This branch (`feat/merge-gate-quarantine`) is cut from `master`, whose `ci.yml` has NO `a11y` job (that lives on the separate, unmerged `feat/cross-browser-a11y` branch). The `web-quarantine` job below is written self-contained — do not reference an `a11y` job. Whichever of the two branches merges second will resolve a small `ci.yml` insertion conflict near `quality-gate`.

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Modify | `.github/workflows/ci.yml` | `web` job excludes `@quarantine`; add non-gating `web-quarantine` job |
| Create | `scripts/setup-branch-protection.sh` | Idempotent `gh api` branch-protection apply |
| Modify | `README.md` | Replace manual-protection note with the script + required-check + PR-only facts |
| Modify | `CLAUDE.md` | Quarantine tag/policy + the two-web-job rule |

No production test file changes. The grep split is verified with a throwaway probe spec that is created and then deleted within Task 1.

---

## Task 1: Split the web job into blocking + quarantine lanes

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Exclude quarantined tests from the blocking `web` job**

In `.github/workflows/ci.yml`, the `web` job currently runs:

```yaml
      - name: Run web tests
        run: npx playwright test --project=web
        env:
          CI: 'true'
```

Change the `run:` line to exclude the quarantine tag:

```yaml
      - name: Run web tests
        run: npx playwright test --project=web --grep-invert @quarantine
        env:
          CI: 'true'
```

- [ ] **Step 2: Add the non-blocking `web-quarantine` job**

Insert this job immediately before the `quality-gate:` job in `.github/workflows/ci.yml`:

```yaml
  # Flaky web tests tagged @quarantine. Report-only: NOT in quality-gate's
  # needs, and the test step is continue-on-error so a flaky failure never
  # turns the job (or the PR) red. They still run so we keep watching them.
  web-quarantine:
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
      - name: Run quarantined web tests (report-only)
        continue-on-error: true
        run: npx playwright test --project=web --grep @quarantine --pass-with-no-tests
        env:
          CI: 'true'
      - name: Test summary
        if: always()
        run: node scripts/ci-summary.mjs web-quarantine
      - name: Upload quarantine HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-web-quarantine
          path: playwright-report/
          retention-days: 14
```

- [ ] **Step 3: Confirm `quality-gate` needs is unchanged**

Verify the `quality-gate` job still reads exactly:

```yaml
  quality-gate:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, security, api, web]
    steps:
      - run: echo "All quality gates passed ✅"
```

`web-quarantine` must NOT appear in `needs` — that is what makes it non-blocking.

- [ ] **Step 4: Create a throwaway probe spec to verify the grep split**

Create `tests/web/_quarantine-probe.spec.ts`:

```ts
import { test } from '@playwright/test';

// Temporary probe to verify the @quarantine grep split. Deleted in Step 6.
test('probe quarantine tag', { tag: '@quarantine' }, async () => {});
```

- [ ] **Step 5: Verify the split selects/deselects correctly (no network — uses `--list`)**

Run: `npx playwright test --project=web --grep @quarantine --list`
Expected: lists exactly one test — `probe quarantine tag`.

Run: `npx playwright test --project=web --grep-invert @quarantine --list`
Expected: lists the real web specs (auth/cart/checkout/contact/home/misc/products) and does NOT list `probe quarantine tag`.

Run: `npx playwright test --project=web --grep @quarantine-does-not-exist --pass-with-no-tests --list`
Expected: exits 0 with no tests selected (proves `--pass-with-no-tests` keeps an empty quarantine green).

- [ ] **Step 6: Delete the probe spec**

Run: `rm tests/web/_quarantine-probe.spec.ts`
Confirm: `git status --short` shows no `_quarantine-probe.spec.ts` (it was never committed).

- [ ] **Step 7: Validate the workflow YAML**

Run:
```bash
node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!/^\s{2}web-quarantine:/m.test(s))throw new Error('web-quarantine job missing');if(!/--grep-invert @quarantine/.test(s))throw new Error('web job not excluding quarantine');if(!/needs:\s*\[lint, typecheck, security, api, web\]/.test(s))throw new Error('quality-gate needs changed');console.log('ci.yml OK')"
```
Expected: prints `ci.yml OK`.

- [ ] **Step 8: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: split web into blocking lane + non-gating @quarantine lane"
```

---

## Task 2: Branch-protection script

**Files:**
- Create: `scripts/setup-branch-protection.sh`

- [ ] **Step 1: Write the script**

Create `scripts/setup-branch-protection.sh`:

```bash
#!/usr/bin/env bash
# Apply branch protection to master:
#   - require the `quality-gate` status check (strict / up-to-date)
#   - require a PR to merge (no direct pushes), with 0 required approvals
#     (solo repo: >0 approvals + enforce_admins would deadlock merges)
#   - enforce on admins too; linear history; no force-push / deletion
# Idempotent — safe to re-run. Prereq: `gh auth login` succeeded, and the
# `quality-gate` check has run at least once on a PR so GitHub knows the name.
set -euo pipefail

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "Applying branch protection to ${REPO}:master ..."

gh api -X PUT "repos/${REPO}/branches/master/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["quality-gate"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Done. Required status checks now:"
gh api "repos/${REPO}/branches/master/protection" --jq '.required_status_checks.contexts'
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x scripts/setup-branch-protection.sh`

- [ ] **Step 3: Syntax-check the script**

Run: `bash -n scripts/setup-branch-protection.sh`
Expected: no output, exit 0 (valid bash).

- [ ] **Step 4: Verify it fails fast when gh is unauthenticated**

Run: `bash scripts/setup-branch-protection.sh; echo "exit=$?"`
Expected (while `gh` is logged out): prints `error: gh is not authenticated. Run 'gh auth login' first.` and `exit=1`. It must NOT attempt the API call.

> Note: actually applying protection (the live PUT) happens later, manually, after `gh auth login` succeeds — see the plan's Post-Implementation step. Do not block this task on a successful apply.

- [ ] **Step 5: Commit**

```bash
git add scripts/setup-branch-protection.sh
git commit -m "chore: add idempotent gh api branch-protection script"
```

---

## Task 3: Documentation

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Update the README "Quality gates" section**

In `README.md`, replace this block:

```markdown
| `api` / `web` | Playwright suites (with step-summary + artifacts) |
| `quality-gate` | passes only if all the above pass |

**Enable merge protection (manual, one-time):** repo **Settings → Branches →
Add branch ruleset** for `master` → enable **Require status checks to pass** →
select **`quality-gate`**. Optionally require a PR before merging.
```

with:

```markdown
| `api` / `web` | Playwright suites (with step-summary + artifacts) |
| `quality-gate` | passes only if all the above pass |

`web` runs only stable tests (`--grep-invert @quarantine`). A separate
**non-gating** `web-quarantine` job runs `@quarantine`-tagged flaky tests
report-only — it never blocks a merge (see `CLAUDE.md`).

**Enable merge protection (one-time):** after `gh auth login`, run
`bash scripts/setup-branch-protection.sh`. This requires the `quality-gate`
check on `master`, makes merges PR-only (no direct pushes, admins included),
and blocks force-pushes/deletions. The script is idempotent.
```

- [ ] **Step 2: Add the quarantine + merge-gate section to CLAUDE.md**

In `CLAUDE.md`, insert this section immediately before `## Conventions`:

```markdown
## Merge gate & quarantine

- `master` is protected: merges are PR-only and require the `quality-gate`
  check (which needs `lint`, `typecheck`, `security`, `api`, `web`). Apply/refresh
  the rule with `bash scripts/setup-branch-protection.sh` (needs `gh auth login`).
- The blocking `web` job runs `--grep-invert @quarantine`; a non-gating
  `web-quarantine` job runs `--grep @quarantine --pass-with-no-tests` and is
  `continue-on-error`. **Never add `web-quarantine` to `quality-gate`'s
  `needs`** — that would let flaky tests block merges.
- **Quarantine policy:** if a web test flakes repeatedly in the Allure trend
  with no code cause, tag it and open a tracking issue:
  ```ts
  test('TC-x: flaky journey', { tag: '@quarantine' }, async ({ home }) => { ... });
  ```
  Quarantine is a holding pen, not a graveyard — fix or delete the test, don't
  let it linger. Retries (`retries=2` in CI) handle one-off transient flake;
  quarantine is only for tests that stay flaky across retries.
```

- [ ] **Step 3: Verify lint + format gates pass**

Run: `npm run lint && npm run format:check`
Expected: both pass. If `format:check` fails, run `npm run format` and re-stage.

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: document required merge gate and web quarantine policy"
```

---

## Final Verification

- [ ] `node -e "const s=require('fs').readFileSync('.github/workflows/ci.yml','utf8');if(!/web-quarantine:/.test(s)||!/--grep-invert @quarantine/.test(s)||!/needs: \[lint, typecheck, security, api, web\]/.test(s))throw new Error('ci.yml');console.log('ci OK')"` → `ci OK`.
- [ ] `bash -n scripts/setup-branch-protection.sh` → exit 0.
- [ ] `bash scripts/setup-branch-protection.sh` (logged out) → prints auth error, `exit=1`, no API call.
- [ ] `git status --short` → clean (no probe spec, no stray files).
- [ ] `npm run lint && npm run format:check` → pass.

## Post-Implementation (manual, requires `gh auth login`)

After this branch's PR is merged and `quality-gate` has run at least once on `master`:

1. `gh auth login` (SSH → web browser; your SSH already works).
2. `bash scripts/setup-branch-protection.sh`.
3. Confirm: open a throwaway PR with a deliberately failing check and verify GitHub blocks the merge; delete the PR.
