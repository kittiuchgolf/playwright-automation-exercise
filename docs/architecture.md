# Architecture

## Two Playwright projects
- `web` — chromium, Page Object Model. Specs in `tests/web/`.
- `api` — no browser, typed `ApiClient`. Specs in `tests/api/`.
Configured in `playwright.config.ts` with separate `baseURL`s.

## Layers
- **Pages** (`src/pages/`): `BasePage` holds `page` + shared header/nav and a
  consent-dismissal helper. Each screen is one page object exposing
  intent-level methods. Selectors live here only.
- **API client** (`src/api/`): one method per endpoint returning `{ status, body }`.
  Centralizes the responseCode-in-body assertion contract.
- **Data** (`src/data/`): `constants.ts` (routes/messages/card), `users.ts`
  (Faker factory + `AccountPayload` mapper).
- **Fixtures** (`src/fixtures.ts`): inject page objects + `api` + a fresh
  `testUser` per test.

## Test data strategy
Faker generates unique users. Flows needing a pre-existing account create it via
the create-account API in setup and delete it via the delete-account API in
teardown, so tests are independent and the shared public site stays clean.

## Reliability on a live, shared site
The target is a public demo site (ads, rate limits) we don't control:
- **Capped workers** (4 local / 2 CI) avoid throttling from too many concurrent
  sessions.
- **Retries** (1 local / 2 CI) absorb transient hiccups.
- A couple of page objects defend against specific live-site behaviors
  (`ProductDetailPage` waits for the add-to-cart `#cartModal`; `CheckoutPage`
  re-clicks "Place Order" until `/payment` loads, since an ad iframe can swallow
  the click).
Page objects are otherwise deterministic — a consistent failure is a real bug.

## Reporting & CI
HTML + Allure reporters. GitHub Actions installs, runs headless, and uploads both
report artifacts.
