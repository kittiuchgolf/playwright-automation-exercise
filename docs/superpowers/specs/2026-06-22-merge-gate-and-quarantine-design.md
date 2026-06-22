# Required Merge Gate + Web Quarantine Lane — Design

**Date:** 2026-06-22
**Status:** Approved (design)
**Goal context:** Portfolio / job-hunt. Make `master` a protected branch where
code only merges through a PR with green CI, while keeping the gate
*trustworthy* despite the inherently flaky live-site web suite.

## Problem

Today nothing enforces CI on merge — a red pipeline can still reach `master`.
We want every change to land via a PR whose checks pass. But the `web` suite
runs against a live, shared, third-party site (`automationexercise.com`) that
restarts, serves ads, and rate-limits, so it occasionally fails for reasons
unrelated to our code. If a persistently flaky web test sits in the required
gate, it blocks legitimate merges and trains us to ignore CI. We need a way to
keep flaky tests *running and visible* without letting them block merges.

## Goals

- `master` accepts changes only via a PR with all required checks green.
- The required gate stays the single existing `quality-gate` aggregator
  (`lint`, `typecheck`, `security`, `api`, `web`).
- Persistently-flaky web tests can be **quarantined**: still executed and
  reported, but excluded from the blocking gate until fixed or deleted.
- Branch protection is applied by a committed, idempotent script (governance as
  code), not by undocumented manual clicks.

## Non-Goals

- Terraform / external IaC (script via `gh api` is sufficient for now).
- Required human review (solo dev — see the approvals nuance below).
- Auto-detection of flaky tests (Allure trend remains the manual detector).
- Changing retry counts or timeouts (existing `retries=2` in CI stays).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Quarantine mechanism | Playwright `@quarantine` **tag** + `--grep`/`--grep-invert` | Tag/untag in one line; no file moves; flexible. |
| Web job structure | Split into blocking `web` + non-blocking `web-quarantine` | Stable subset gates; flaky subset is report-only. |
| Required check | The single `quality-gate` context | Already aggregates lint/type/security/api/web; one check to require. |
| Protection method | Committed `gh api` script | Reproducible, in-repo, no new tooling. |
| Strictness | Require PR + checks, `enforce_admins: true` | No direct pushes to master, even for the owner. |
| Required approvals | **0** | Solo dev cannot approve their own PR; >0 with admins enforced would deadlock merges. PR-required + green-checks still holds. |

## Architecture

### 1. Quarantine tagging convention

A flaky test is tagged with Playwright's `tag` option:

```ts
test('TC-x: sometimes-flaky journey', { tag: '@quarantine' }, async ({ home }) => {
  // ...
});
```

- **No tests start quarantined.** The tag is applied reactively when the Allure
  trend shows a test flaking with no code cause.
- Policy (documented in `CLAUDE.md`): if a web test flakes repeatedly in the
  trend without a code cause, tag it `@quarantine` and open a tracking issue;
  fix or delete it — quarantine is a holding pen, not a graveyard.

### 2. CI job split — `.github/workflows/ci.yml`

Replace the single `web` job's test command and add a sibling job:

- **`web` (blocking, stays in `quality-gate.needs`):**
  ```bash
  npx playwright test --project=web --grep-invert @quarantine
  ```
  Runs every web test except quarantined ones.

- **`web-quarantine` (NEW, non-blocking, NOT in `quality-gate.needs`):**
  ```bash
  npx playwright test --project=web --grep @quarantine --pass-with-no-tests
  ```
  Same structure as the existing `a11y` job: `if: always()` summary step,
  artifact upload, and it can never block a merge. `--pass-with-no-tests`
  ensures an empty quarantine set does not error the job.

Both jobs install `--with-deps chromium` and emit a `ci-summary.mjs` step
summary (passing `web` / `web-quarantine` as the label).

### 3. Quality gate — unchanged needs

`quality-gate.needs` remains exactly:

```yaml
needs: [lint, typecheck, security, api, web]
```

`web` now means "stable web tests". `web-quarantine` and `a11y` are deliberately
absent so neither can block a merge.

### 4. Branch protection script — `scripts/setup-branch-protection.sh`

A bash script using `gh api`, idempotent and re-runnable:

- Derives `OWNER/REPO` via `gh repo view --json nameWithOwner`.
- `PUT /repos/{owner}/{repo}/branches/master/protection` with:
  - `required_status_checks`: `{ strict: true, contexts: ["quality-gate"] }`
    — branch must be up to date and `quality-gate` must pass.
  - `required_pull_request_reviews`: `{ required_approving_review_count: 0 }`
    — a PR is required to merge, but no human approval (solo dev).
  - `enforce_admins`: `true` — applies to the owner too.
  - `required_linear_history`: `true`, `allow_force_pushes`: `false`,
    `allow_deletions`: `false`, `restrictions`: `null`.
- Prints the resulting protection summary and exits non-zero with a clear
  message if `gh` is unauthenticated.

Prerequisite documented in the script header and README: `gh auth login` must
succeed first, and the `quality-gate` check must have run at least once on a PR
so GitHub recognizes the context name.

### 5. Documentation

- **README** "Quality gates" section: state that `quality-gate` is the required
  status check, that merges happen only via PR, and how to apply protection
  (`bash scripts/setup-branch-protection.sh`).
- **CLAUDE.md**: the two-web-job split, the quarantine tag + policy, and the
  rule "never add `web-quarantine` or `a11y` to `quality-gate.needs`".

## File Change List

| Action | File | Purpose |
|---|---|---|
| Modify | `.github/workflows/ci.yml` | `web` uses `--grep-invert @quarantine`; add non-gating `web-quarantine` job |
| Create | `scripts/setup-branch-protection.sh` | Idempotent `gh api` branch-protection setup |
| Modify | `README.md` | Document required check + protection script |
| Modify | `CLAUDE.md` | Quarantine policy + two-web-job rule |

(No production test files change unless/until a real test is quarantined; the
mechanism is verified with a temporary tagged test, then reverted — see
Verification.)

## Verification

- **Grep split:** temporarily tag one trivial web test `@quarantine`; confirm
  `npx playwright test --project=web --grep-invert @quarantine` excludes it and
  `--grep @quarantine` selects only it; then untag.
- **Empty quarantine:** `npx playwright test --project=web --grep @quarantine
  --pass-with-no-tests` exits 0 with no tests.
- **YAML:** `web-quarantine` job parses; `quality-gate.needs` is unchanged
  (no `web-quarantine`, no `a11y`).
- **Script (dry checks):** `bash -n scripts/setup-branch-protection.sh` parses;
  run aborts with a clear message when `gh auth status` fails.
- **Live apply (manual, after auth):** run the script; `gh api
  repos/{owner}/{repo}/branches/master/protection` reflects the settings; open a
  PR with a deliberately failing check and confirm merge is blocked.

## Risks

- **Self-deadlock:** mitigated by `required_approving_review_count: 0`.
- **Context name mismatch:** the required context must equal the job name
  `quality-gate`; if GitHub shows it pending forever, the name is wrong — verify
  against a completed run.
- **gh auth:** apply step depends on a working `gh` login (currently failing);
  the script fails fast with guidance rather than half-applying.

## Follow-up (separate specs)

- Dockerization (still queued).
- Optional later: migrate this protection to Terraform GitHub provider if an
  IaC showcase is wanted.
