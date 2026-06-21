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
    await productDetail.submitReview(
      testUser.name,
      testUser.email,
      'Great product, fast delivery.',
    );
    await expect(productDetail.reviewSuccess).toBeVisible();
    await expect(productDetail.reviewSuccess).toContainText('Thank you for your review.');
  });
});
