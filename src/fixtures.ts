import { test as base, request } from '@playwright/test';
import { ApiClient } from './api/api-client.js';
import { makeUser, type TestUser } from './data/users.js';
import { HomePage } from './pages/home-page.js';
import { LoginPage } from './pages/login-page.js';
import { SignupPage } from './pages/signup-page.js';

type Fixtures = {
  api: ApiClient;
  testUser: TestUser;
  home: HomePage;
  login: LoginPage;
  signup: SignupPage;
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
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  signup: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
});

export { expect } from '@playwright/test';
export { request };
