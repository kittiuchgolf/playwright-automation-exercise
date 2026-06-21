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
    await expect(
      products.page.getByRole('heading', { name: /Women - Dress Products/i }),
    ).toBeVisible();
  });

  test('TC19: view products by brand', async ({ products }) => {
    await products.open();
    await products.selectBrand('Polo');
    await expect(
      products.page.getByRole('heading', { name: /Brand - Polo Products/i }),
    ).toBeVisible();
    expect(await products.allProducts.count()).toBeGreaterThan(0);
  });
});
