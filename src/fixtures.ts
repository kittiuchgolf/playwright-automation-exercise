import { test as base, request } from '@playwright/test';
import { ApiClient } from './api/api-client.js';
import { makeUser, type TestUser } from './data/users.js';
import { HomePage } from './pages/home-page.js';

type Fixtures = {
  api: ApiClient;
  testUser: TestUser;
  home: HomePage;
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
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect } from '@playwright/test';
export { request };
