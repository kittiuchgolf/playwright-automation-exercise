import { test, expect } from '../../src/fixtures.js';

test.describe('Cart', () => {
  // QUARANTINE (tracking): intermittently flaky from CI (add-to-cart modal/ad
  // overlay), green locally. Report-only in web-quarantine until stabilized.
  test(
    'TC12: add two products to cart',
    { tag: '@quarantine' },
    async ({ products, productDetail, cart }) => {
      await products.open();
      await products.viewProduct(0);
      await productDetail.addToCartAndContinue();
      await products.open();
      await products.viewProduct(1);
      await productDetail.addToCartAndViewCart();
      expect(await cart.rows.count()).toBeGreaterThanOrEqual(2);
    },
  );

  // QUARANTINE (tracking): intermittently flaky from CI, green locally.
  test(
    'TC13: product quantity in cart reflects detail page',
    { tag: '@quarantine' },
    async ({ products, productDetail, cart }) => {
      await products.open();
      await products.viewProduct(0);
      await productDetail.setQuantity(4);
      await productDetail.addToCartAndViewCart();
      await expect(cart.rows.first().locator('.cart_quantity button')).toHaveText('4');
    },
  );

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
