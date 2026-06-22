import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL ?? 'https://automationexercise.com';
const API_URL = process.env.API_URL ?? 'https://automationexercise.com';

const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never' }],
  ['allure-playwright'],
];
if (process.env.CI) {
  reporters.push(['github'], ['json', { outputFile: 'results.json' }]);
}

const FULL = !!process.env.FULL_MATRIX; // nightly sets this to run every engine
const IGNORE_A11Y = /a11y\.spec\.ts/; // a11y runs only in its own Chromium project

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
  reporter: reporters,
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
      testIgnore: IGNORE_A11Y,
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
    ...(FULL
      ? [
          {
            name: 'web-firefox',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Desktop Firefox'], baseURL: BASE_URL },
          },
          {
            name: 'web-webkit',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Desktop Safari'], baseURL: BASE_URL },
          },
          {
            name: 'web-mobile',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['Pixel 5'], baseURL: BASE_URL },
          },
          {
            name: 'web-mobile-safari',
            testDir: './tests/web',
            testIgnore: IGNORE_A11Y,
            use: { ...devices['iPhone 13'], baseURL: BASE_URL },
          },
        ]
      : []),
    {
      name: 'a11y',
      testDir: './tests/web',
      testMatch: IGNORE_A11Y,
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
  ],
});
