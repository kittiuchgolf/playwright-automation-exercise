import { test, expect } from '../../src/fixtures.js';

test.describe('Home page', () => {
  test('home page loads with featured products', async ({ home }) => {
    await home.open();
    await expect(home.featuredItems.first()).toBeVisible();
    expect(await home.featuredItems.count()).toBeGreaterThan(0);
  });
});
