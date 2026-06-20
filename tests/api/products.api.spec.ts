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
