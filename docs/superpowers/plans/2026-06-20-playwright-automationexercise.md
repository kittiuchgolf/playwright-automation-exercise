# Playwright automationexercise.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript Playwright project testing automationexercise.com with a POM web suite (~18 tests) and an API suite covering all 14 endpoints, plus Allure + GitHub Actions CI and a full `.claude/` setup.

**Architecture:** Two Playwright projects in one config — `web` (chromium, Page Object Model under `src/pages`) and `api` (no browser, typed `ApiClient` over `APIRequestContext`). The API client centralizes the site's quirk that every response is HTTP 200 with the real status in `body.responseCode`. Shared Faker-based test data and custom fixtures wire pages + api + a fresh `testUser` into every test.

**Tech Stack:** Node 20+, TypeScript (ESM), `@playwright/test`, `@faker-js/faker`, `allure-playwright`, GitHub Actions.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` / `tsconfig.json` / `.gitignore` / `.env.example` | Project + tooling config |
| `playwright.config.ts` | `web` + `api` projects, html + allure reporters |
| `src/data/constants.ts` | URLs, expected message strings, payment card |
| `src/data/users.ts` | `TestUser` type, Faker factory, API payload mapper |
| `src/api/types.ts` | API response + payload interfaces |
| `src/api/api-client.ts` | One typed method per endpoint, returns `{ status, body }` |
| `src/pages/*.ts` | `BasePage` + one page object per screen |
| `src/fixtures.ts` | Custom fixtures: pages + `api` + `testUser` |
| `tests/api/*.spec.ts` | 3 API specs (products, auth, account) |
| `tests/web/*.spec.ts` | 6 web specs (auth, products, cart, checkout, contact, misc) |
| `.github/workflows/ci.yml` | CI: install → test → upload reports |
| `scripts/smoke.sh` | 1 web + 1 api sanity run |
| `CLAUDE.md` + `.claude/**` | Claude Anatomy: guide, commands, subagent, settings |
| `docs/architecture.md` / `docs/api-notes.md` / `README.md` | Project docs |

**Selector note:** automationexercise.com exposes `data-qa` attributes for most form controls and key result banners. Use those first; fall back to role/text locators. Each page-object task includes a step to confirm selectors against the live site with `npx playwright codegen https://automationexercise.com` (or Playwright MCP if configured) before finalizing.

---

## Phase 0 — Scaffold & shared infrastructure

### Task 1: Project tooling (package.json, tsconfig, gitignore, env)

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "playwright-automationexercise",
  "version": "1.0.0",
  "description": "Playwright TypeScript web + API automation for automationexercise.com",
  "type": "module",
  "private": true,
  "engines": { "node": ">=18" },
  "scripts": {
    "test": "playwright test",
    "test:web": "playwright test --project=web",
    "test:api": "playwright test --project=api",
    "report": "playwright show-report",
    "allure:generate": "allure generate allure-results --clean -o allure-report",
    "allure:open": "allure open allure-report",
    "typecheck": "tsc --noEmit",
    "smoke": "bash scripts/smoke.sh"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.0",
    "@types/node": "^22.10.0",
    "@faker-js/faker": "^9.3.0",
    "allure-playwright": "^3.0.0",
    "allure-commandline": "^2.32.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": { "@src/*": ["src/*"] },
    "noEmit": true
  },
  "include": ["src", "tests", "playwright.config.ts"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
test-results/
playwright-report/
allure-results/
allure-report/
blob-report/
.env
*.log
.DS_Store
```

- [ ] **Step 4: Create `.env.example`**

```dotenv
# Defaults target the live production site; override locally if needed.
BASE_URL=https://automationexercise.com
API_URL=https://automationexercise.com
```

- [ ] **Step 5: Install dependencies and browser**

Run: `npm install && npx playwright install chromium`
Expected: install completes, chromium downloaded.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore .env.example
git commit -m "chore: scaffold project tooling and dependencies"
```

---

### Task 2: Playwright config (web + api projects, reporters)

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL ?? 'https://automationexercise.com';
const API_URL = process.env.API_URL ?? 'https://automationexercise.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright'],
  ],
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL },
    },
    {
      name: 'web',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
  ],
});
```

> Note: `dotenv` ships transitively, but to be safe add it explicitly: `npm install -D dotenv`.

- [ ] **Step 2: Install dotenv**

Run: `npm install -D dotenv`
Expected: added to devDependencies.

- [ ] **Step 3: Verify config parses**

Run: `npx playwright test --list`
Expected: command runs without config errors (0 tests listed is fine — none exist yet).

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "feat: add playwright config with web and api projects"
```

---

### Task 3: Constants and Faker user factory

**Files:**
- Create: `src/data/constants.ts`, `src/data/users.ts`

- [ ] **Step 1: Create `src/data/constants.ts`**

```ts
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  products: '/products',
  contact: '/contact_us',
  cart: '/view_cart',
  checkout: '/checkout',
  payment: '/payment',
  testCases: '/test_cases',
} as const;

export const API = {
  productsList: '/api/productsList',
  brandsList: '/api/brandsList',
  searchProduct: '/api/searchProduct',
  verifyLogin: '/api/verifyLogin',
  createAccount: '/api/createAccount',
  deleteAccount: '/api/deleteAccount',
  updateAccount: '/api/updateAccount',
  getUserDetailByEmail: '/api/getUserDetailByEmail',
} as const;

export const MESSAGES = {
  methodNotSupported: 'This request method is not supported.',
  searchParamMissing: 'Bad request, search_product parameter is missing in POST request.',
  loginParamMissing: 'Bad request, email or password parameter is missing in POST request.',
  userExists: 'User exists!',
  userNotFound: 'User not found!',
  userCreated: 'User created!',
  userUpdated: 'User updated!',
  accountDeleted: 'Account deleted!',
} as const;

export const PAYMENT_CARD = {
  nameOnCard: 'Test Tester',
  cardNumber: '4111111111111111',
  cvc: '311',
  expiryMonth: '12',
  expiryYear: '2030',
} as const;
```

- [ ] **Step 2: Create `src/data/users.ts`**

```ts
import { faker } from '@faker-js/faker';
import type { AccountPayload } from '../api/types.js';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDay: string;
  birthMonth: string; // '1'..'12'
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: 'United States' | 'India' | 'Canada' | 'Australia' | 'Israel' | 'New Zealand' | 'Singapore';
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName, provider: `pw${Date.now()}.test` }).toLowerCase(),
    password: 'Passw0rd!23',
    title: 'Mr',
    birthDay: '10',
    birthMonth: '5',
    birthYear: '1990',
    firstName,
    lastName,
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: 'United States',
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('#####'),
    mobile: faker.string.numeric(10),
    ...overrides,
  };
}

export function toAccountPayload(u: TestUser): AccountPayload {
  return {
    name: u.name,
    email: u.email,
    password: u.password,
    title: u.title,
    birth_date: u.birthDay,
    birth_month: u.birthMonth,
    birth_year: u.birthYear,
    firstname: u.firstName,
    lastname: u.lastName,
    company: u.company,
    address1: u.address1,
    address2: u.address2,
    country: u.country,
    zipcode: u.zipcode,
    state: u.state,
    city: u.city,
    mobile_number: u.mobile,
  };
}
```

- [ ] **Step 3: Commit** (types.ts is created in Task 4; this will not typecheck until then — that is expected. Commit anyway as a checkpoint.)

```bash
git add src/data/constants.ts src/data/users.ts
git commit -m "feat: add constants and faker user factory"
```

---

### Task 4: API types and ApiClient

**Files:**
- Create: `src/api/types.ts`, `src/api/api-client.ts`

- [ ] **Step 1: Create `src/api/types.ts`**

```ts
export interface BaseBody {
  responseCode: number;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface ProductsListBody extends BaseBody {
  products: Product[];
}

export interface Brand {
  id: number;
  brand: string;
}

export interface BrandsListBody extends BaseBody {
  brands: Brand[];
}

export interface UserDetailBody extends BaseBody {
  user: {
    id: number;
    name: string;
    email: string;
    title: string;
    first_name: string;
    last_name: string;
    country: string;
    city: string;
  };
}

export interface AccountPayload {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export interface ApiResult<T extends BaseBody> {
  status: number; // transport HTTP status — always 200 for this API
  body: T;
}
```

- [ ] **Step 2: Create `src/api/api-client.ts`**

```ts
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API } from '../data/constants.js';
import type {
  ApiResult, BaseBody, ProductsListBody, BrandsListBody, UserDetailBody, AccountPayload,
} from './types.js';

/**
 * Typed wrapper over Playwright's APIRequestContext.
 *
 * IMPORTANT: automationexercise APIs always return HTTP 200. The real status
 * lives in body.responseCode. Every method returns { status, body } so specs
 * assert on body.responseCode + body.message, never on the transport status.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private async wrap<T extends BaseBody>(res: APIResponse): Promise<ApiResult<T>> {
    const status = res.status();
    const body = (await res.json()) as T;
    return { status, body };
  }

  // API 1
  getAllProducts(): Promise<ApiResult<ProductsListBody>> {
    return this.request.get(API.productsList).then((r) => this.wrap<ProductsListBody>(r));
  }
  // API 2 — unsupported method -> responseCode 405
  postProductsList(): Promise<ApiResult<BaseBody>> {
    return this.request.post(API.productsList).then((r) => this.wrap<BaseBody>(r));
  }
  // API 3
  getAllBrands(): Promise<ApiResult<BrandsListBody>> {
    return this.request.get(API.brandsList).then((r) => this.wrap<BrandsListBody>(r));
  }
  // API 4 — unsupported method -> responseCode 405
  putBrandsList(): Promise<ApiResult<BaseBody>> {
    return this.request.put(API.brandsList).then((r) => this.wrap<BaseBody>(r));
  }
  // API 5
  searchProduct(searchTerm: string): Promise<ApiResult<ProductsListBody>> {
    return this.request
      .post(API.searchProduct, { form: { search_product: searchTerm } })
      .then((r) => this.wrap<ProductsListBody>(r));
  }
  // API 6 — missing param -> responseCode 400
  searchProductNoParam(): Promise<ApiResult<BaseBody>> {
    return this.request.post(API.searchProduct).then((r) => this.wrap<BaseBody>(r));
  }
  // API 7 / 10 — valid or invalid creds
  verifyLogin(email: string, password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.verifyLogin, { form: { email, password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 8 — missing email -> responseCode 400
  verifyLoginMissingEmail(password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.verifyLogin, { form: { password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 9 — unsupported method -> responseCode 405
  deleteVerifyLogin(): Promise<ApiResult<BaseBody>> {
    return this.request.delete(API.verifyLogin).then((r) => this.wrap<BaseBody>(r));
  }
  // API 11 -> responseCode 201
  createAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.createAccount, { form: { ...payload } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 12 -> responseCode 200
  deleteAccount(email: string, password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .delete(API.deleteAccount, { form: { email, password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 13 -> responseCode 200
  updateAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
    return this.request
      .put(API.updateAccount, { form: { ...payload } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 14 -> responseCode 200
  getUserDetailByEmail(email: string): Promise<ApiResult<UserDetailBody>> {
    return this.request
      .get(API.getUserDetailByEmail, { params: { email } })
      .then((r) => this.wrap<UserDetailBody>(r));
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors across data + api modules).

- [ ] **Step 4: Commit**

```bash
git add src/api/types.ts src/api/api-client.ts
git commit -m "feat: add typed API client and response types"
```

---

### Task 5: Custom fixtures

**Files:**
- Create: `src/fixtures.ts`
- Note: page object imports are added as each page object is created. Start with `api` + `testUser`; extend in later tasks.

- [ ] **Step 1: Create `src/fixtures.ts`** (initial version — api + testUser only)

```ts
import { test as base, request } from '@playwright/test';
import { ApiClient } from './api/api-client.js';
import { makeUser, type TestUser } from './data/users.js';

type Fixtures = {
  api: ApiClient;
  testUser: TestUser;
};

export const test = base.extend<Fixtures>({
  // Fresh API client bound to a standalone request context (API host).
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL });
    await use(new ApiClient(ctx));
    await ctx.dispose();
  },
  // A unique Faker user per test.
  testUser: async ({}, use) => {
    await use(makeUser());
  },
});

export { expect } from '@playwright/test';
export { request };
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/fixtures.ts
git commit -m "feat: add base fixtures (api client + faker test user)"
```

---

## Phase 1 — API suite (all 14 endpoints)

> TDD note: each spec is the deliverable. "Red" = run before the client method exists (already implemented in Task 4, so these should pass first run). Run each spec, confirm pass, commit. If a live assertion fails, that is a real finding — investigate the response body before changing the expectation.

### Task 6: Products & brands API spec (APIs 1–6)

**Files:**
- Create: `tests/api/products.api.spec.ts`

- [ ] **Step 1: Write `tests/api/products.api.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { MESSAGES } from '../../src/data/constants.js';

test.describe('Products & Brands API', () => {
  test('API 1: GET productsList returns 200 with products', async ({ api }) => {
    const { status, body } = await api.getAllProducts();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.products[0]).toHaveProperty('name');
  });

  test('API 2: POST productsList is not supported (405)', async ({ api }) => {
    const { status, body } = await api.postProductsList();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe(MESSAGES.methodNotSupported);
  });

  test('API 3: GET brandsList returns 200 with brands', async ({ api }) => {
    const { status, body } = await api.getAllBrands();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(body.brands.length).toBeGreaterThan(0);
    expect(body.brands[0]).toHaveProperty('brand');
  });

  test('API 4: PUT brandsList is not supported (405)', async ({ api }) => {
    const { status, body } = await api.putBrandsList();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe(MESSAGES.methodNotSupported);
  });

  test('API 5: POST searchProduct returns matching products', async ({ api }) => {
    const { status, body } = await api.searchProduct('top');
    expect(status).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('API 6: POST searchProduct without param returns 400', async ({ api }) => {
    const { status, body } = await api.searchProductNoParam();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe(MESSAGES.searchParamMissing);
  });
});
```

- [ ] **Step 2: Run**

Run: `npx playwright test --project=api tests/api/products.api.spec.ts`
Expected: 6 passed.

- [ ] **Step 3: Commit**

```bash
git add tests/api/products.api.spec.ts
git commit -m "test(api): products and brands endpoints (APIs 1-6)"
```

---

### Task 7: Auth/verifyLogin API spec (APIs 7–10)

**Files:**
- Create: `tests/api/auth.api.spec.ts`

- [ ] **Step 1: Write `tests/api/auth.api.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { MESSAGES } from '../../src/data/constants.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('verifyLogin API', () => {
  // A real account is needed for the "valid" case. Create via API, delete after.
  test('API 7: verifyLogin with valid credentials returns "User exists!"', async ({ api, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      const { status, body } = await api.verifyLogin(testUser.email, testUser.password);
      expect(status).toBe(200);
      expect(body.responseCode).toBe(200);
      expect(body.message).toBe(MESSAGES.userExists);
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('API 8: verifyLogin without email returns 400', async ({ api }) => {
    const { status, body } = await api.verifyLoginMissingEmail('whatever');
    expect(status).toBe(200);
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe(MESSAGES.loginParamMissing);
  });

  test('API 9: DELETE verifyLogin is not supported (405)', async ({ api }) => {
    const { status, body } = await api.deleteVerifyLogin();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe(MESSAGES.methodNotSupported);
  });

  test('API 10: verifyLogin with invalid credentials returns "User not found!"', async ({ api }) => {
    const { status, body } = await api.verifyLogin('does-not-exist@nope.test', 'wrongpass');
    expect(status).toBe(200);
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe(MESSAGES.userNotFound);
  });
});
```

- [ ] **Step 2: Run**

Run: `npx playwright test --project=api tests/api/auth.api.spec.ts`
Expected: 4 passed.
> If API 8's message string differs from `MESSAGES.loginParamMissing`, copy the exact `body.message` from the failure output into `constants.ts` and re-run. (This message is the one slightly uncertain string.)

- [ ] **Step 3: Commit**

```bash
git add tests/api/auth.api.spec.ts src/data/constants.ts
git commit -m "test(api): verifyLogin endpoints (APIs 7-10)"
```

---

### Task 8: Account lifecycle API spec (APIs 11–14)

**Files:**
- Create: `tests/api/account.api.spec.ts`

- [ ] **Step 1: Write `tests/api/account.api.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { MESSAGES } from '../../src/data/constants.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Account lifecycle API (create → read → update → delete)', () => {
  test('APIs 11/14/13/12: full account lifecycle', async ({ api, testUser }) => {
    const payload = toAccountPayload(testUser);

    // API 11 — create
    const created = await api.createAccount(payload);
    expect(created.status).toBe(200);
    expect(created.body.responseCode).toBe(201);
    expect(created.body.message).toBe(MESSAGES.userCreated);

    try {
      // API 14 — read back
      const detail = await api.getUserDetailByEmail(testUser.email);
      expect(detail.body.responseCode).toBe(200);
      expect(detail.body.user.email).toBe(testUser.email);
      expect(detail.body.user.name).toBe(testUser.name);

      // API 13 — update (change city)
      const updatedPayload = { ...payload, city: 'Updated City' };
      const updated = await api.updateAccount(updatedPayload);
      expect(updated.body.responseCode).toBe(200);
      expect(updated.body.message).toBe(MESSAGES.userUpdated);

      const afterUpdate = await api.getUserDetailByEmail(testUser.email);
      expect(afterUpdate.body.user.city).toBe('Updated City');
    } finally {
      // API 12 — delete (cleanup, also asserted)
      const deleted = await api.deleteAccount(testUser.email, testUser.password);
      expect(deleted.body.responseCode).toBe(200);
      expect(deleted.body.message).toBe(MESSAGES.accountDeleted);
    }
  });
});
```

- [ ] **Step 2: Run**

Run: `npx playwright test --project=api tests/api/account.api.spec.ts`
Expected: 1 passed.

- [ ] **Step 3: Run the whole API project**

Run: `npm run test:api`
Expected: 11 passed (6 + 4 + 1).

- [ ] **Step 4: Commit**

```bash
git add tests/api/account.api.spec.ts
git commit -m "test(api): account lifecycle (APIs 11-14)"
```

---

## Phase 2 — Web suite (POM)

> Each task: create the page object(s), add their fixture(s), write the spec, run against the live site, fix selectors if needed, commit. Confirm `data-qa` selectors with `npx playwright codegen https://automationexercise.com` before finalizing each page object.

### Task 9: BasePage + HomePage + smoke test

**Files:**
- Create: `src/pages/base-page.ts`, `src/pages/home-page.ts`, `tests/web/home.spec.ts`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create `src/pages/base-page.ts`**

```ts
import type { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissConsentIfPresent();
  }

  /** automationexercise shows Google ad consent / ad iframes; ignore gracefully. */
  async dismissConsentIfPresent(): Promise<void> {
    const consent = this.page.getByRole('button', { name: /consent|agree|accept/i }).first();
    if (await consent.isVisible().catch(() => false)) {
      await consent.click().catch(() => undefined);
    }
  }

  header(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  async clickSignupLogin(): Promise<void> {
    await this.page.getByRole('link', { name: ' Signup / Login' }).click();
  }

  async clickLogout(): Promise<void> {
    await this.page.getByRole('link', { name: ' Logout' }).click();
  }

  async clickDeleteAccount(): Promise<void> {
    await this.page.getByRole('link', { name: ' Delete Account' }).click();
  }

  loggedInAs(name: string): Locator {
    return this.page.getByText(`Logged in as ${name}`);
  }
}
```

- [ ] **Step 2: Create `src/pages/home-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class HomePage extends BasePage {
  readonly featuredItems: Locator = this.page.locator('.features_items .product-image-wrapper');
  readonly subscribeEmail: Locator = this.page.locator('#susbscribe_email'); // site's id (typo intentional)
  readonly subscribeButton: Locator = this.page.locator('#subscribe');
  readonly subscribeSuccess: Locator = this.page.locator('#success-subscribe .alert-success');

  async open(): Promise<void> {
    await this.goto('/');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscribeEmail.fill(email);
    await this.subscribeButton.click();
  }
}
```

- [ ] **Step 3: Extend `src/fixtures.ts`** — add `home` fixture

Add the import and fixture (keep existing `api`/`testUser`):

```ts
import { HomePage } from './pages/home-page.js';
// ...add to Fixtures type:
//   home: HomePage;
// ...add to test.extend object:
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
```

- [ ] **Step 4: Write `tests/web/home.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';

test.describe('Home page', () => {
  test('home page loads with featured products', async ({ home }) => {
    await home.open();
    await expect(home.featuredItems.first()).toBeVisible();
    expect(await home.featuredItems.count()).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Confirm selectors live, then run**

Run: `npx playwright test --project=web tests/web/home.spec.ts`
Expected: 1 passed. If the featured-items selector differs, open `npx playwright codegen https://automationexercise.com`, hover the product grid, and update `home-page.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/base-page.ts src/pages/home-page.ts src/fixtures.ts tests/web/home.spec.ts
git commit -m "feat(web): BasePage + HomePage with home smoke test"
```

---

### Task 10: Auth flow — LoginPage, SignupPage, auth.spec.ts (TC1–TC5)

**Files:**
- Create: `src/pages/login-page.ts`, `src/pages/signup-page.ts`, `tests/web/auth.spec.ts`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create `src/pages/login-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class LoginPage extends BasePage {
  readonly loginEmail: Locator = this.page.locator('[data-qa="login-email"]');
  readonly loginPassword: Locator = this.page.locator('[data-qa="login-password"]');
  readonly loginButton: Locator = this.page.locator('[data-qa="login-button"]');
  readonly loginError: Locator = this.page.getByText('Your email or password is incorrect!');

  readonly signupName: Locator = this.page.locator('[data-qa="signup-name"]');
  readonly signupEmail: Locator = this.page.locator('[data-qa="signup-email"]');
  readonly signupButton: Locator = this.page.locator('[data-qa="signup-button"]');
  readonly signupError: Locator = this.page.getByText('Email Address already exist!');

  async open(): Promise<void> {
    await this.goto(ROUTES.login);
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }
}
```

- [ ] **Step 2: Create `src/pages/signup-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import type { TestUser } from '../data/users.js';

export class SignupPage extends BasePage {
  readonly accountCreated: Locator = this.page.locator('[data-qa="account-created"]');
  readonly continueButton: Locator = this.page.locator('[data-qa="continue-button"]');

  async fillAccountDetails(u: TestUser): Promise<void> {
    await this.page.locator(u.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.page.locator('[data-qa="password"]').fill(u.password);
    await this.page.locator('[data-qa="days"]').selectOption(u.birthDay);
    await this.page.locator('[data-qa="months"]').selectOption(u.birthMonth);
    await this.page.locator('[data-qa="years"]').selectOption(u.birthYear);
    await this.page.locator('[data-qa="first_name"]').fill(u.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(u.lastName);
    await this.page.locator('[data-qa="company"]').fill(u.company);
    await this.page.locator('[data-qa="address"]').fill(u.address1);
    await this.page.locator('[data-qa="address2"]').fill(u.address2);
    await this.page.locator('[data-qa="country"]').selectOption(u.country);
    await this.page.locator('[data-qa="state"]').fill(u.state);
    await this.page.locator('[data-qa="city"]').fill(u.city);
    await this.page.locator('[data-qa="zipcode"]').fill(u.zipcode);
    await this.page.locator('[data-qa="mobile_number"]').fill(u.mobile);
    await this.page.locator('[data-qa="create-account"]').click();
  }

  async continueAfterCreation(): Promise<void> {
    await this.continueButton.click();
  }
}
```

- [ ] **Step 3: Extend `src/fixtures.ts`** — add `login` and `signup`

```ts
import { LoginPage } from './pages/login-page.js';
import { SignupPage } from './pages/signup-page.js';
// Fixtures type: login: LoginPage; signup: SignupPage;
  login: async ({ page }, use) => { await use(new LoginPage(page)); },
  signup: async ({ page }, use) => { await use(new SignupPage(page)); },
```

- [ ] **Step 4: Write `tests/web/auth.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Authentication', () => {
  test('TC1: register a new user and delete account', async ({ login, signup, home, testUser }) => {
    await login.open();
    await login.startSignup(testUser.name, testUser.email);
    await signup.fillAccountDetails(testUser);
    await expect(signup.accountCreated).toBeVisible();
    await signup.continueAfterCreation();
    await expect(home.loggedInAs(testUser.name)).toBeVisible();
    await login.clickDeleteAccount();
    await expect(login.page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });

  test('TC5: register with an existing email shows error', async ({ api, login, testUser }) => {
    // Seed the account via API so the email already exists.
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.startSignup(testUser.name, testUser.email);
      await expect(login.signupError).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC2: login with valid credentials', async ({ api, login, home, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC3: login with invalid credentials shows error', async ({ login }) => {
    await login.open();
    await login.login('no-such-user@nope.test', 'wrongpass');
    await expect(login.loginError).toBeVisible();
  });

  test('TC4: logout after login', async ({ api, login, home, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();
      await login.clickLogout();
      await expect(login.loginButton).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });
});
```

- [ ] **Step 5: Run**

Run: `npx playwright test --project=web tests/web/auth.spec.ts`
Expected: 5 passed. Confirm signup-form `data-qa` selectors live if any step fails.

- [ ] **Step 6: Commit**

```bash
git add src/pages/login-page.ts src/pages/signup-page.ts src/fixtures.ts tests/web/auth.spec.ts
git commit -m "test(web): auth flows register/login/logout (TC1-TC5)"
```

---

### Task 11: Products — ProductsPage, ProductDetailPage, products.spec.ts (TC8, TC9, TC18, TC19)

**Files:**
- Create: `src/pages/products-page.ts`, `src/pages/product-detail-page.ts`, `tests/web/products.spec.ts`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create `src/pages/products-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class ProductsPage extends BasePage {
  readonly allProducts: Locator = this.page.locator('.features_items .product-image-wrapper');
  readonly searchInput: Locator = this.page.locator('#search_product');
  readonly searchButton: Locator = this.page.locator('#submit_search');
  readonly searchedProductsTitle: Locator = this.page.getByRole('heading', { name: 'Searched Products' });

  async open(): Promise<void> {
    await this.goto(ROUTES.products);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async viewProduct(index: number): Promise<void> {
    await this.allProducts.nth(index).getByRole('link', { name: 'View Product' }).click();
  }

  async expandCategory(parent: string): Promise<void> {
    await this.page.locator('#accordian').getByRole('link', { name: parent }).click();
  }

  async selectSubCategory(sub: string): Promise<void> {
    await this.page.locator('.panel-collapse.in').getByRole('link', { name: sub }).click();
  }

  async selectBrand(brand: string): Promise<void> {
    await this.page.locator('.brands_products').getByRole('link', { name: new RegExp(brand) }).click();
  }
}
```

- [ ] **Step 2: Create `src/pages/product-detail-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class ProductDetailPage extends BasePage {
  readonly info: Locator = this.page.locator('.product-information');
  readonly name: Locator = this.page.locator('.product-information h2');
  readonly quantity: Locator = this.page.locator('#quantity');
  readonly addToCart: Locator = this.page.locator('button.cart');

  // Review form
  readonly reviewName: Locator = this.page.locator('#name');
  readonly reviewEmail: Locator = this.page.locator('#email');
  readonly reviewText: Locator = this.page.locator('#review');
  readonly reviewSubmit: Locator = this.page.locator('#button-review');
  readonly reviewSuccess: Locator = this.page.locator('#review-section .alert-success');

  async setQuantity(qty: number): Promise<void> {
    await this.quantity.fill(String(qty));
  }

  async addToCartAndContinue(): Promise<void> {
    await this.addToCart.click();
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async submitReview(name: string, email: string, text: string): Promise<void> {
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewText.fill(text);
    await this.reviewSubmit.click();
  }
}
```

- [ ] **Step 3: Extend `src/fixtures.ts`** — add `products` and `productDetail`

```ts
import { ProductsPage } from './pages/products-page.js';
import { ProductDetailPage } from './pages/product-detail-page.js';
// Fixtures: products: ProductsPage; productDetail: ProductDetailPage;
  products: async ({ page }, use) => { await use(new ProductsPage(page)); },
  productDetail: async ({ page }, use) => { await use(new ProductDetailPage(page)); },
```

- [ ] **Step 4: Write `tests/web/products.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';

test.describe('Products', () => {
  test('TC8: view all products and open a product detail', async ({ products, productDetail }) => {
    await products.open();
    await expect(products.allProducts.first()).toBeVisible();
    await products.viewProduct(0);
    await expect(productDetail.info).toBeVisible();
    await expect(productDetail.name).not.toBeEmpty();
  });

  test('TC9: search for a product', async ({ products }) => {
    await products.open();
    await products.search('dress');
    await expect(products.searchedProductsTitle).toBeVisible();
    expect(await products.allProducts.count()).toBeGreaterThan(0);
  });

  test('TC18: view products by category', async ({ products }) => {
    await products.open();
    await products.expandCategory('Women');
    await products.selectSubCategory('Dress');
    await expect(products.page.getByRole('heading', { name: /Women - Dress Products/i })).toBeVisible();
  });

  test('TC19: view products by brand', async ({ products }) => {
    await products.open();
    await products.selectBrand('Polo');
    await expect(products.page.getByRole('heading', { name: /Brand - Polo Products/i })).toBeVisible();
    expect(await products.allProducts.count()).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Run**

Run: `npx playwright test --project=web tests/web/products.spec.ts`
Expected: 4 passed. Verify category/brand sidebar text live if TC18/TC19 fail.

- [ ] **Step 6: Commit**

```bash
git add src/pages/products-page.ts src/pages/product-detail-page.ts src/fixtures.ts tests/web/products.spec.ts
git commit -m "test(web): products listing/search/category/brand (TC8,9,18,19)"
```

---

### Task 12: Cart — CartPage, cart.spec.ts (TC12, TC13, TC17)

**Files:**
- Create: `src/pages/cart-page.ts`, `tests/web/cart.spec.ts`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create `src/pages/cart-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class CartPage extends BasePage {
  readonly rows: Locator = this.page.locator('#cart_info_table tbody tr');
  readonly proceedToCheckout: Locator = this.page.getByText('Proceed To Checkout');

  async open(): Promise<void> {
    await this.goto(ROUTES.cart);
  }

  rowFor(productId: number): Locator {
    return this.page.locator(`#product-${productId}`);
  }

  quantityFor(productId: number): Locator {
    return this.rowFor(productId).locator('.cart_quantity button');
  }

  async removeRow(productId: number): Promise<void> {
    await this.rowFor(productId).locator('.cart_quantity_delete').click();
  }
}
```

- [ ] **Step 2: Extend `src/fixtures.ts`** — add `cart`

```ts
import { CartPage } from './pages/cart-page.js';
// Fixtures: cart: CartPage;
  cart: async ({ page }, use) => { await use(new CartPage(page)); },
```

- [ ] **Step 3: Write `tests/web/cart.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';

test.describe('Cart', () => {
  test('TC12: add two products to cart', async ({ products, productDetail, cart }) => {
    await products.open();
    await products.viewProduct(0);
    await productDetail.addToCartAndContinue();
    await products.open();
    await products.viewProduct(1);
    await productDetail.addToCart.click();
    await cart.open();
    expect(await cart.rows.count()).toBeGreaterThanOrEqual(2);
  });

  test('TC13: product quantity in cart reflects detail page', async ({ products, productDetail, cart }) => {
    await products.open();
    await products.viewProduct(0);
    await productDetail.setQuantity(4);
    await productDetail.addToCart.click();
    await cart.open();
    await expect(cart.rows.first().locator('.cart_quantity button')).toHaveText('4');
  });

  test('TC17: remove a product from the cart', async ({ products, productDetail, cart }) => {
    await products.open();
    await products.viewProduct(0);
    await productDetail.addToCartAndContinue();
    await cart.open();
    const before = await cart.rows.count();
    await cart.rows.first().locator('.cart_quantity_delete').click();
    await expect(cart.rows).toHaveCount(before - 1);
  });
});
```

- [ ] **Step 4: Run**

Run: `npx playwright test --project=web tests/web/cart.spec.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/cart-page.ts src/fixtures.ts tests/web/cart.spec.ts
git commit -m "test(web): cart add/quantity/remove (TC12,13,17)"
```

---

### Task 13: Checkout — CheckoutPage, PaymentPage, checkout.spec.ts (TC14, TC16, TC23)

**Files:**
- Create: `src/pages/checkout-page.ts`, `src/pages/payment-page.ts`, `tests/web/checkout.spec.ts`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create `src/pages/checkout-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class CheckoutPage extends BasePage {
  readonly deliveryAddress: Locator = this.page.locator('#address_delivery');
  readonly orderComment: Locator = this.page.locator('textarea[name="message"]');
  readonly placeOrder: Locator = this.page.getByText('Place Order');

  async addComment(text: string): Promise<void> {
    await this.orderComment.fill(text);
  }

  async proceedToPayment(): Promise<void> {
    await this.placeOrder.click();
  }
}
```

- [ ] **Step 2: Create `src/pages/payment-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { PAYMENT_CARD } from '../data/constants.js';

export class PaymentPage extends BasePage {
  readonly orderPlaced: Locator = this.page.locator('[data-qa="order-placed"], .alert-success').first();

  async pay(): Promise<void> {
    await this.page.locator('[data-qa="name-on-card"]').fill(PAYMENT_CARD.nameOnCard);
    await this.page.locator('[data-qa="card-number"]').fill(PAYMENT_CARD.cardNumber);
    await this.page.locator('[data-qa="cvc"]').fill(PAYMENT_CARD.cvc);
    await this.page.locator('[data-qa="expiry-month"]').fill(PAYMENT_CARD.expiryMonth);
    await this.page.locator('[data-qa="expiry-year"]').fill(PAYMENT_CARD.expiryYear);
    await this.page.locator('[data-qa="pay-button"]').click();
  }
}
```

- [ ] **Step 3: Extend `src/fixtures.ts`** — add `checkout` and `payment`

```ts
import { CheckoutPage } from './pages/checkout-page.js';
import { PaymentPage } from './pages/payment-page.js';
// Fixtures: checkout: CheckoutPage; payment: PaymentPage;
  checkout: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  payment: async ({ page }, use) => { await use(new PaymentPage(page)); },
```

- [ ] **Step 4: Write `tests/web/checkout.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Checkout', () => {
  test('TC16: login before checkout, place order', async ({ api, login, home, products, productDetail, cart, checkout, payment, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();

      await products.open();
      await products.viewProduct(0);
      await productDetail.addToCartAndContinue();
      await cart.open();
      await cart.proceedToCheckout.click();

      await checkout.addComment('Please deliver fast.');
      await checkout.proceedToPayment();
      await payment.pay();
      await expect(payment.orderPlaced).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC23: verify delivery address matches the registered user', async ({ api, login, home, products, productDetail, cart, checkout, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();

      await products.open();
      await products.viewProduct(0);
      await productDetail.addToCartAndContinue();
      await cart.open();
      await cart.proceedToCheckout.click();

      await expect(checkout.deliveryAddress).toContainText(testUser.firstName);
      await expect(checkout.deliveryAddress).toContainText(testUser.city);
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC14: register while checkout, place order', async ({ login, signup, home, products, productDetail, cart, checkout, payment, testUser }) => {
    await products.open();
    await products.viewProduct(0);
    await productDetail.addToCartAndContinue();
    await cart.open();
    await cart.proceedToCheckout.click();

    // Not logged in -> modal offers register/login
    await cart.page.getByRole('link', { name: /Register \/ Login/i }).click();
    await login.startSignup(testUser.name, testUser.email);
    await signup.fillAccountDetails(testUser);
    await expect(signup.accountCreated).toBeVisible();
    await signup.continueAfterCreation();
    await expect(home.loggedInAs(testUser.name)).toBeVisible();

    await cart.open();
    await cart.proceedToCheckout.click();
    await checkout.addComment('Registered at checkout.');
    await checkout.proceedToPayment();
    await payment.pay();
    await expect(payment.orderPlaced).toBeVisible();

    await login.clickDeleteAccount();
    await expect(login.page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });
});
```

- [ ] **Step 5: Run**

Run: `npx playwright test --project=web tests/web/checkout.spec.ts`
Expected: 3 passed. The checkout modal link text ("Register / Login") is the most likely selector to need live confirmation.

- [ ] **Step 6: Commit**

```bash
git add src/pages/checkout-page.ts src/pages/payment-page.ts src/fixtures.ts tests/web/checkout.spec.ts
git commit -m "test(web): checkout flows place-order + address (TC14,16,23)"
```

---

### Task 14: Contact form — ContactPage, contact.spec.ts (TC6)

**Files:**
- Create: `src/pages/contact-page.ts`, `tests/web/contact.spec.ts`, `tests/fixtures/upload.txt`
- Modify: `src/fixtures.ts`

- [ ] **Step 1: Create upload fixture file `tests/fixtures/upload.txt`**

```text
automationexercise contact-us upload test file
```

- [ ] **Step 2: Create `src/pages/contact-page.ts`**

```ts
import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class ContactPage extends BasePage {
  readonly name: Locator = this.page.locator('[data-qa="name"]');
  readonly email: Locator = this.page.locator('[data-qa="email"]');
  readonly subject: Locator = this.page.locator('[data-qa="subject"]');
  readonly message: Locator = this.page.locator('[data-qa="message"]');
  readonly file: Locator = this.page.locator('input[name="upload_file"]');
  readonly submit: Locator = this.page.locator('[data-qa="submit-button"]');
  readonly success: Locator = this.page.locator('.status.alert.alert-success');

  async open(): Promise<void> {
    await this.goto(ROUTES.contact);
  }

  async submitForm(opts: { name: string; email: string; subject: string; message: string; filePath: string }): Promise<void> {
    await this.name.fill(opts.name);
    await this.email.fill(opts.email);
    await this.subject.fill(opts.subject);
    await this.message.fill(opts.message);
    await this.file.setInputFiles(opts.filePath);
    // Accept the native confirm() dialog the site triggers on submit.
    this.page.once('dialog', (d) => d.accept());
    await this.submit.click();
  }
}
```

- [ ] **Step 3: Extend `src/fixtures.ts`** — add `contact`

```ts
import { ContactPage } from './pages/contact-page.js';
// Fixtures: contact: ContactPage;
  contact: async ({ page }, use) => { await use(new ContactPage(page)); },
```

- [ ] **Step 4: Write `tests/web/contact.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD = path.resolve(__dirname, 'fixtures/upload.txt');

test.describe('Contact Us', () => {
  test('TC6: submit the contact form with a file upload', async ({ contact, testUser }) => {
    await contact.open();
    await contact.submitForm({
      name: testUser.name,
      email: testUser.email,
      subject: 'Automated test enquiry',
      message: 'This is an automated contact-form submission.',
      filePath: UPLOAD,
    });
    await expect(contact.success).toBeVisible();
    await expect(contact.success).toContainText('Success');
  });
});
```

- [ ] **Step 5: Run**

Run: `npx playwright test --project=web tests/web/contact.spec.ts`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add src/pages/contact-page.ts src/fixtures.ts tests/web/contact.spec.ts tests/fixtures/upload.txt
git commit -m "test(web): contact-us form with file upload (TC6)"
```

---

### Task 15: Misc — subscription + product review, misc.spec.ts (TC10, TC21)

**Files:**
- Create: `tests/web/misc.spec.ts`
- (Reuses HomePage subscription locators and ProductDetailPage review locators.)

- [ ] **Step 1: Write `tests/web/misc.spec.ts`**

```ts
import { test, expect } from '../../src/fixtures.js';

test.describe('Misc journeys', () => {
  test('TC10: subscribe from the home page footer', async ({ home, testUser }) => {
    await home.open();
    await home.subscribeEmail.scrollIntoViewIfNeeded();
    await home.subscribe(testUser.email);
    await expect(home.subscribeSuccess).toBeVisible();
    await expect(home.subscribeSuccess).toContainText('successfully subscribed');
  });

  test('TC21: add a review on a product', async ({ products, productDetail, testUser }) => {
    await products.open();
    await products.viewProduct(0);
    await expect(productDetail.info).toBeVisible();
    await productDetail.submitReview(testUser.name, testUser.email, 'Great product, fast delivery.');
    await expect(productDetail.reviewSuccess).toBeVisible();
    await expect(productDetail.reviewSuccess).toContainText('Thank you for your review.');
  });
});
```

- [ ] **Step 2: Run**

Run: `npx playwright test --project=web tests/web/misc.spec.ts`
Expected: 2 passed.

- [ ] **Step 3: Run the whole web project**

Run: `npm run test:web`
Expected: 18 passed (1+5+4+3+3+1+1 from home through misc).

- [ ] **Step 4: Commit**

```bash
git add tests/web/misc.spec.ts
git commit -m "test(web): subscription + product review (TC10,21)"
```

---

## Phase 3 — Infra, docs & Claude Anatomy

### Task 16: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
  workflow_dispatch:

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run tests
        run: npx playwright test
        env:
          CI: 'true'
      - name: Upload Playwright HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
      - name: Upload Allure results
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: allure-results
          path: allure-results/
          retention-days: 14
```

- [ ] **Step 2: Validate YAML locally**

Run: `node -e "require('fs').readFileSync('.github/workflows/ci.yml','utf8'); console.log('yaml file present')"`
Expected: prints "yaml file present".

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow with report artifacts"
```

---

### Task 17: Smoke script

**Files:**
- Create: `scripts/smoke.sh`

- [ ] **Step 1: Create `scripts/smoke.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
# Quick sanity: one API spec + the home web smoke test.
npx playwright test --project=api tests/api/products.api.spec.ts
npx playwright test --project=web tests/web/home.spec.ts
echo "Smoke passed."
```

- [ ] **Step 2: Make executable and run**

Run: `chmod +x scripts/smoke.sh && npm run smoke`
Expected: API products spec + home spec pass, prints "Smoke passed."

- [ ] **Step 3: Commit**

```bash
git add scripts/smoke.sh package.json
git commit -m "chore: add smoke script"
```

---

### Task 18: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create `CLAUDE.md`**

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md project guide"
```

---

### Task 19: `.claude/` setup — settings, commands, subagent

**Files:**
- Create: `.claude/settings.json`, `.claude/commands/run-web.md`, `.claude/commands/run-api.md`, `.claude/commands/new-page.md`, `.claude/agents/test-author.md`

- [ ] **Step 1: Create `.claude/settings.json`**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx playwright *)",
      "Bash(npx tsc *)",
      "Bash(git status)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ]
  }
}
```

- [ ] **Step 2: Create `.claude/commands/run-web.md`**

```markdown
---
description: Run the web (UI) Playwright suite, optionally filtered by a grep pattern
---

Run the web test project. If `$ARGUMENTS` is provided, pass it as a `-g` grep filter.

Run: `npx playwright test --project=web ${ARGUMENTS:+-g "$ARGUMENTS"}`

Then summarize pass/fail counts and, if anything failed, the failing test names and the first assertion error for each.
```

- [ ] **Step 3: Create `.claude/commands/run-api.md`**

```markdown
---
description: Run the API Playwright suite, optionally filtered by a grep pattern
---

Run the api test project. If `$ARGUMENTS` is provided, pass it as a `-g` grep filter.

Run: `npx playwright test --project=api ${ARGUMENTS:+-g "$ARGUMENTS"}`

Remember: assertions are on `body.responseCode` + `body.message`, not the HTTP status. If a test fails, print the actual response body before proposing a fix.
```

- [ ] **Step 4: Create `.claude/commands/new-page.md`**

```markdown
---
description: Scaffold a new page object + register its fixture
---

Create a new page object for the screen named in `$ARGUMENTS`.

1. Create `src/pages/<kebab-name>-page.ts` extending `BasePage`, with intent-level
   methods and `data-qa`/role locators. Confirm selectors with
   `npx playwright codegen https://automationexercise.com`.
2. Register the page as a fixture in `src/fixtures.ts` (add to the `Fixtures` type
   and the `test.extend` object).
3. Run `npm run typecheck` and report the result.
```

- [ ] **Step 5: Create `.claude/agents/test-author.md`**

```markdown
---
name: test-author
description: Authors a new Playwright test (page object + spec) for automationexercise.com following project conventions. Use when adding coverage for a screen or flow.
tools: Read, Edit, Write, Bash, Grep, Glob
---

You author Playwright tests for this repo. Follow these rules strictly:

- Read `CLAUDE.md` first for conventions.
- Web: create/extend a page object under `src/pages/` (extend `BasePage`,
  intent-level methods, `data-qa`/role locators), register it in
  `src/fixtures.ts`, then write the spec under `tests/web/`.
- API: add a typed method to `src/api/api-client.ts` returning `{ status, body }`,
  add types to `src/api/types.ts`, write the spec under `tests/api/` asserting
  `body.responseCode` + `body.message`.
- Tests needing an account create/delete it via the API in setup/teardown.
- Use `makeUser()` for unique data. Never hardcode accounts.
- Confirm selectors with codegen before finalizing.
- After writing, run the new spec and `npm run typecheck`; report results with
  evidence (command output). Do not claim success without a passing run.
```

- [ ] **Step 6: Commit**

```bash
git add .claude/
git commit -m "feat: add .claude setup (settings, commands, test-author agent)"
```

---

### Task 20: Project docs (README, architecture, api-notes)

**Files:**
- Create: `README.md`, `docs/architecture.md`, `docs/api-notes.md`

- [ ] **Step 1: Create `docs/api-notes.md`**

```markdown
# API Notes

Source: https://automationexercise.com/api_list (14 endpoints).

## The responseCode quirk
Every endpoint returns transport **HTTP 200**. The logical status is in
`body.responseCode` with a human `body.message`. Tests assert on the body.

| # | Method | Path | responseCode | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | /api/productsList | 200 | products[] |
| 2 | POST | /api/productsList | 405 | method not supported |
| 3 | GET | /api/brandsList | 200 | brands[] |
| 4 | PUT | /api/brandsList | 405 | method not supported |
| 5 | POST | /api/searchProduct | 200 | form: search_product |
| 6 | POST | /api/searchProduct | 400 | param missing |
| 7 | POST | /api/verifyLogin | 200 | form: email,password → "User exists!" |
| 8 | POST | /api/verifyLogin | 400 | missing email |
| 9 | DELETE | /api/verifyLogin | 405 | method not supported |
| 10 | POST | /api/verifyLogin | 404 | invalid creds → "User not found!" |
| 11 | POST | /api/createAccount | 201 | full account form → "User created!" |
| 12 | DELETE | /api/deleteAccount | 200 | form: email,password → "Account deleted!" |
| 13 | PUT | /api/updateAccount | 200 | full account form → "User updated!" |
| 14 | GET | /api/getUserDetailByEmail | 200 | query: email |

Request bodies are form-encoded. `createAccount`/`updateAccount` need the full
account field set (see `AccountPayload` in `src/api/types.ts`).
```

- [ ] **Step 2: Create `docs/architecture.md`**

```markdown
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

## Reporting & CI
HTML + Allure reporters. GitHub Actions installs, runs headless, and uploads both
report artifacts.
```

- [ ] **Step 3: Create `README.md`**

````markdown
# playwright-automationexercise

Playwright + TypeScript web & API automation for
[automationexercise.com](https://automationexercise.com).

## Quick start
```bash
npm install
npx playwright install chromium
cp .env.example .env   # optional; defaults target the live site
npm test               # web + api
```

## Suites
- **Web** (`tests/web/`) — Page Object Model, ~18 tests mapped to the site's
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

## Docs
- `CLAUDE.md` — guide for Claude Code (commands, conventions, the API quirk).
- `docs/architecture.md` — layered design.
- `docs/api-notes.md` — endpoint table + the responseCode behavior.

## CI
`.github/workflows/ci.yml` runs the full suite headless and uploads the HTML +
Allure artifacts.
````

- [ ] **Step 4: Final full run + typecheck**

Run: `npm run typecheck && npm test`
Expected: typecheck clean; 29 tests pass (11 api + 18 web). Investigate any live-site flake with a single re-run before concluding.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/architecture.md docs/api-notes.md
git commit -m "docs: add README, architecture, and API notes"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** Web TC1-TC6, TC8-TC10, TC12-TC14, TC16-TC19, TC21, TC23 → Tasks 9-15. All 14 APIs → Tasks 6-8. Config/reporters → Task 2. Faker → Task 3. Allure → Tasks 1,2,20. CI → Task 16. CLAUDE.md + `.claude/` → Tasks 18-19. Docs → Task 20. responseCode quirk → Task 4 (client) + every API spec. No gaps.
- **Placeholder scan:** No TBD/TODO. Selectors are concrete `data-qa`/role locators with per-page live-confirmation steps (the one honest uncertainty on a live third-party site).
- **Type consistency:** `ApiResult<T>`, `BaseBody`, `ProductsListBody`, `BrandsListBody`, `UserDetailBody`, `AccountPayload`, `TestUser`, `makeUser`, `toAccountPayload` are defined in Tasks 3-4 and used consistently in Tasks 6-8 and 10-13. Fixture names (`home`, `login`, `signup`, `products`, `productDetail`, `cart`, `checkout`, `payment`, `contact`, `api`, `testUser`) are introduced once and reused consistently.

## Out of scope (per spec, YAGNI)
Cross-browser matrix, visual regression, perf/load, and TC7/TC11/TC15/TC20/TC22/TC24/TC25/TC26.
