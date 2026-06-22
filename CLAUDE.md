# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is
Playwright + TypeScript automation for https://automationexercise.com.
Two suites: **web** (Page Object Model) and **api** (typed client over all 14
documented endpoints at https://automationexercise.com/api_list).

## Commands
| Command | Purpose |
|---|---|
| `npm test` | Run all tests (web + api) |
| `npm run test:web` | Web suite only (chromium) |
| `npm run test:api` | API suite only (no browser) |
| `npm run report` | Open the Playwright HTML report |
| `npm run allure:generate && npm run allure:open` | Build + open Allure report |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Fast sanity (1 api + 1 web test) |
| `npx playwright test path --project=web -g "TC1"` | Run a single test |
| `npx playwright codegen https://automationexercise.com` | Discover/confirm selectors |

## Structure
- `src/pages/` — page objects; one per screen, extend `BasePage`. Expose
  intent-level methods; never leak raw selectors into specs.
- `src/api/` — `api-client.ts` (one method per endpoint) + `types.ts`.
- `src/data/` — `constants.ts` (routes, messages, card) + `users.ts` (Faker).
- `src/fixtures.ts` — custom fixtures: every page object + `api` + `testUser`.
- `tests/web/`, `tests/api/` — specs grouped by area/resource.

## CRITICAL: the API responseCode quirk
Every automationexercise API returns **HTTP 200**, even for errors. The real
status is in `body.responseCode` with a human `body.message`. Always assert:
```ts
const { status, body } = await api.someCall();
expect(status).toBe(200);            // transport — always 200
expect(body.responseCode).toBe(405); // the API's real outcome
expect(body.message).toBe('...');    // exact documented string
```
Never assert on `response.status()` for the logical outcome.

## Testing against a live, shared site
The target is a public demo site we do not control, with ads and rate limits.
Reliability choices live in `playwright.config.ts`:
- **Capped workers** (4 local / 2 CI) — too many concurrent sessions throttle it.
- **Retries** (1 local / 2 CI) — absorb transient load/ad-overlay hiccups.
- Page objects are deterministic; if a test is *consistently* failing, that's a
  real bug — debug it. If it fails ~once then passes on retry, that's the site.
- To run rock-solid, point `BASE_URL`/`API_URL` (see `.env.example`) at a
  self-hosted instance of automationexercise.

## Merge gate & quarantine

- `master` is protected: merges are PR-only and require the `quality-gate`
  check (which needs `lint`, `typecheck`, `security`, `api`, `web`). Apply/refresh
  the rule with `bash scripts/setup-branch-protection.sh` (needs `gh auth login`).
- The blocking `web` job runs `--grep-invert @quarantine`; a non-gating
  `web-quarantine` job runs `--grep @quarantine --pass-with-no-tests` with
  `continue-on-error: true` on its **test step**, so flaky test failures never
  turn it red. **Never add `web-quarantine` to `quality-gate`'s
  `needs`** — that would let flaky tests block merges.
- **Quarantine policy:** if a web test flakes repeatedly in the Allure trend
  with no code cause, tag it and open a tracking issue:
  ```ts
  test('TC-x: flaky journey', { tag: '@quarantine' }, async ({ home }) => { ... });
  ```
  Quarantine is a holding pen, not a graveyard — fix or delete the test, don't
  let it linger. Retries (`retries=2` in CI) handle one-off transient flake;
  quarantine is only for tests that stay flaky across retries.

## Conventions
- TypeScript ESM. Import local files with the `.js` extension (e.g.
  `import { X } from './x.js'`).
- Tests that need an account create it via the **create-account API** in setup
  and delete it via the **delete-account API** in teardown — keep tests
  self-contained and the shared public site clean.
- Use Faker (`makeUser()`) for unique emails; never hardcode accounts.
- Prefer `data-qa` attributes, then role/text locators. Avoid brittle CSS.

## How to add a new web test
1. If a new screen is involved, create `src/pages/<name>-page.ts` extending
   `BasePage` with intent methods; confirm selectors via codegen.
2. Register it as a fixture in `src/fixtures.ts`.
3. Add the spec under `tests/web/`, mapping it to the official test case number.

## How to add a new API test
1. Add a typed method to `src/api/api-client.ts` returning `{ status, body }`.
2. Add response/payload types to `src/api/types.ts`.
3. Add the spec under `tests/api/`, asserting `responseCode` + `message`.

## Custom Claude tooling in this repo
- `.claude/commands/run-web.md`, `run-api.md`, `new-page.md` — slash commands.
- `.claude/agents/test-author.md` — subagent that authors a page object + spec
  following these conventions.
