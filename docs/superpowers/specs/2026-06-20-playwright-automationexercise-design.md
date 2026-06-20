# Design: Playwright TypeScript Automation for automationexercise.com

- **Date:** 2026-06-20
- **Status:** Approved (design gate)
- **Target site:** https://automationexercise.com
- **API reference:** https://automationexercise.com/api_list

## 1. Goal

Build a maintainable TypeScript Playwright project that tests
automationexercise.com across two suites:

- **Web (UI)** — Page Object Model, ~18 end-to-end tests across 6 spec files,
  drawn from the site's published test cases
  (https://automationexercise.com/test_cases).
- **API** — a typed API client covering all 14 endpoints from `/api_list`,
  asserting on the `responseCode` field inside the JSON body.

The project also ships a full `.claude/` setup ("Claude Anatomy"): a
`CLAUDE.md` guide plus custom slash commands and a test-author subagent.

## 2. The central API behavior (drives the API client design)

automationexercise's APIs return **HTTP 200 for every response**, including
"errors". The documented `405 / 400 / 404 / 201 / 200` status is NOT the HTTP
status line — it is a `responseCode` number inside the JSON body, alongside a
human-readable `message`. Verified live on 2026-06-20:

| Call | HTTP status | body.responseCode | body.message |
|---|---|---|---|
| `GET /api/productsList` | 200 | 200 | (products array) |
| `POST /api/productsList` | 200 | 405 | "This request method is not supported." |
| `POST /api/searchProduct` (no param) | 200 | 400 | "Bad request, search_product parameter is missing in POST request." |

**Consequence:** every API assertion must check `body.responseCode` and
`body.message`, NOT `response.status()`. The transport status is only a
sanity check (always 200). This is centralized in the `ApiClient` so no spec
can drift back to a meaningless `status()` assertion.

```ts
// Pattern every API test follows:
const { status, body } = await api.postProductsList(); // wrong method on purpose
expect(status).toBe(200);                 // transport always 200
expect(body.responseCode).toBe(405);      // the API's real outcome
expect(body.message).toContain('not supported');
```

## 3. Project structure

```
playwright-automationexercise/
├── CLAUDE.md                      # project guide for Claude Code
├── .claude/
│   ├── settings.json              # permissions, env hints
│   ├── commands/                  # /run-web, /run-api, /new-page
│   └── agents/                    # test-author subagent
├── .github/workflows/ci.yml       # install -> test (headless) -> upload reports
├── playwright.config.ts           # projects: web (chromium) + api; html + allure
├── tsconfig.json
├── .env.example                   # BASE_URL, API_URL, optional persistent creds
├── .gitignore
├── package.json
├── src/
│   ├── pages/                     # BasePage + page objects (see 4.1)
│   ├── api/
│   │   ├── api-client.ts          # typed wrapper over APIRequestContext
│   │   └── types.ts               # response + payload interfaces
│   ├── data/
│   │   ├── users.ts               # faker-based user factory
│   │   └── constants.ts           # urls, expected messages, payment card
│   └── fixtures.ts                # custom fixtures: pages + api + testUser
├── tests/
│   ├── web/                       # *.spec.ts grouped by journey area
│   └── api/                       # *.spec.ts grouped by resource
├── docs/
│   ├── architecture.md
│   ├── api-notes.md               # the responseCode quirk, payloads, gotchas
│   └── superpowers/specs/         # this design doc + future specs
└── scripts/
    └── smoke.sh                   # quick sanity run (1 web + 1 api test)
```

Conventions follow the user's existing Playwright project: TypeScript, ESM,
Playwright Test runner, POM under `src/pages`, shared `fixtures.ts`,
`scripts/`, `docs/`, `.env.example`, `tsconfig.json`.

## 4. Web suite

### 4.1 Page objects (`src/pages`)

- `BasePage` — wraps `page`; common header/nav (`goto`, `clickSignupLogin`,
  `verifyLoggedInAs`, `clickLogout`, `consentIfPresent` for ad/consent overlays).
- `HomePage` — landing, featured products, subscription footer, scroll-up.
- `LoginPage` — login + signup forms on `/login` (`login()`, `startSignup()`,
  `assertLoginError()`, `assertEmailExistsError()`).
- `SignupPage` — account-details form on `/signup` (`fillAccount(user)`,
  `submit()`, `assertCreated()`).
- `ProductsPage` — `/products`: list, search, category & brand filters,
  `viewProduct()`, `addToCart()`.
- `ProductDetailPage` — `/product_details/:id`: details, quantity, add review.
- `CartPage` — `/view_cart`: rows, quantities, remove, proceed to checkout.
- `CheckoutPage` — address review, order comment, place order.
- `PaymentPage` — card form, confirm, download invoice.
- `ContactPage` — `/contact_us`: form + file upload + success assertion.

Page objects expose **intent-level methods**, never raw selectors, to tests.

### 4.2 Web specs (~18 tests across 6 files -> official test cases)

| Spec file | Test cases covered |
|---|---|
| `auth.spec.ts` | Register user (TC1), Register w/ existing email (TC5), Login valid (TC2), Login invalid (TC3), Logout (TC4) |
| `products.spec.ts` | All products + detail (TC8), Search product (TC9), View category (TC18), View & cart brand products (TC19) |
| `cart.spec.ts` | Add products to cart (TC12), Verify product quantity (TC13), Remove from cart (TC17) |
| `checkout.spec.ts` | Register while checkout (TC14), Login before checkout (TC16), Verify address details (TC23) |
| `contact.spec.ts` | Contact Us form with file upload (TC6) |
| `misc.spec.ts` | Subscription on home (TC10), Add review on product (TC21) |

### 4.3 Test data & cleanup

- Registration/checkout tests create a **unique Faker user** per test.
- Tests that need a pre-existing account (e.g. UI login-valid TC2,
  login-before-checkout TC16) create that account via the **create-account API**
  in `beforeEach`, exercise the UI, then remove it — keeping each test
  self-contained and order-independent rather than depending on the register test.
- Cleanup runs in `afterEach` via the **delete-account API** so the public,
  shared site stays clean and re-runs remain green.
- A `testUser` fixture provides a fresh user; `constants.ts` holds the static
  payment card and expected message strings.

## 5. API suite (all 14 endpoints)

`ApiClient` constructed with a Playwright `APIRequestContext`; one method per
endpoint, each returning `{ status, body }` with typed `body`.

| Spec file | APIs |
|---|---|
| `products.api.spec.ts` | 1 GET productsList (200), 2 POST productsList (405), 3 GET brandsList (200), 4 PUT brandsList (405), 5 POST searchProduct valid (200), 6 POST searchProduct missing param (400) |
| `auth.api.spec.ts` | 7 verifyLogin valid (200 "User exists!"), 8 verifyLogin missing email (400), 9 DELETE verifyLogin (405), 10 verifyLogin invalid (404 "User not found!") |
| `account.api.spec.ts` | 11 createAccount (201) -> 14 getUserDetailByEmail (200) -> 13 updateAccount (200) -> 12 deleteAccount (200), chained with one Faker user |

The account lifecycle spec creates an account through API 11, reads it (API 14),
updates it (API 13), and deletes it (API 12) so it is fully self-contained and
leaves no residue. APIs 7/8/10 (verifyLogin) reuse a short-lived account created
and deleted within the spec so a "valid" login has a real backing user.

## 6. Configuration, reporting, CI

- `playwright.config.ts`: two projects — `web` (chromium, `baseURL` = site) and
  `api` (no browser, `baseURL` = API host). Reporters: `html` + `allure-playwright`.
  `retries: process.env.CI ? 1 : 0`; trace/screenshot/video on first retry.
- **CI** (`.github/workflows/ci.yml`): checkout -> setup Node 20 -> `npm ci` ->
  `npx playwright install --with-deps chromium` -> `npx playwright test` ->
  upload `playwright-report/` and `allure-results/` as artifacts (always()).
- **.env**: `BASE_URL`, `API_URL` (default to production site), optional creds.

## 7. Claude Anatomy (`.claude/` + CLAUDE.md)

- `CLAUDE.md` — overview, commands (`test`, `test:web`, `test:api`, `report`,
  `allure`, `typecheck`), folder map, conventions, **the responseCode quirk**,
  and "how to add a page object / a web test / an API test".
- `.claude/commands/` — `/run-web`, `/run-api`, `/new-page` slash commands.
- `.claude/agents/` — a `test-author` subagent scoped to write a new POM + spec
  following project conventions.
- `.claude/settings.json` — sensible permissions for `npx playwright`, `npm`, git.

## 8. Selector discovery

Selectors are derived from the **live site** via Playwright MCP if configured,
otherwise `npx playwright codegen https://automationexercise.com`. Prefer
role/text-based locators over brittle CSS. Confirm real DOM before finalizing
each page object.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Shared public site is flaky/slow | `retries` on CI, `waitForLoadState`, resilient role/text locators |
| Ad iframes / consent overlays | `consentIfPresent()` helper in BasePage; scope locators to main content |
| Account collisions on re-run | Faker-unique emails + API-based cleanup in afterEach |
| API "errors" hidden behind HTTP 200 | Assert on `body.responseCode` + `body.message`, centralized in ApiClient |
| Site DOM changes over time | Intent-level page methods isolate selector churn to one file each |

## 10. Out of scope (YAGNI)

- Cross-browser matrix (firefox/webkit) — chromium only for now.
- Visual regression / screenshot diffing.
- Performance/load testing.
- Test cases TC7, TC11, TC15, TC20, TC22, TC24, TC25, TC26 (lower value or
  redundant with chosen journeys); easy to add later using the same patterns.
