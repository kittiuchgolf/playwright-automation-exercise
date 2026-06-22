import { test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

// Public pages reachable without auth/cart state. Checkout is intentionally
// excluded (needs a logged-in user + items in cart) — see the design spec.
const ROUTES = ['/', '/products', '/product_details/1', '/view_cart', '/login', '/contact_us'];

const OUT_DIR = 'a11y-results';

const slug = (route: string) =>
  route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    // Full detail goes to the report for humans.
    await testInfo.attach('axe-violations', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    // Machine-readable per-route result for the baseline diff (rule ids only).
    const ids = [...new Set(results.violations.map((v) => v.id))].sort();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug(route)}.json`),
      JSON.stringify({ route, violations: ids }, null, 2),
    );

    // Report-only: no assertion that can fail the build.
  });
}
