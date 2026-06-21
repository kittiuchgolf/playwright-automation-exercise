import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL ?? 'https://automationexercise.com';
const API_URL = process.env.API_URL ?? 'https://automationexercise.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // automationexercise.com is a live, shared, ad-serving demo site we don't
  // control. Transient slowness/ad-overlay click drops are unavoidable, so we
  // retry (standard for live-site E2E) rather than assert against a perfectly
  // stable environment. Page objects are deterministic; retries cover the site.
  retries: process.env.CI ? 2 : 1,
  // Cap parallelism so we don't overload the shared site with too many
  // concurrent browser sessions (which throttles and scatters flakes).
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],
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
