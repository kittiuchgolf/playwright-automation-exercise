import { test as base, request } from '@playwright/test';
import { ApiClient } from './api/api-client.js';
import { makeUser, type TestUser } from './data/users.js';
import { HomePage } from './pages/home-page.js';
import { LoginPage } from './pages/login-page.js';
import { SignupPage } from './pages/signup-page.js';
import { ProductsPage } from './pages/products-page.js';
import { ProductDetailPage } from './pages/product-detail-page.js';
import { CartPage } from './pages/cart-page.js';
import { CheckoutPage } from './pages/checkout-page.js';
import { PaymentPage } from './pages/payment-page.js';
import { ContactPage } from './pages/contact-page.js';

type Fixtures = {
  api: ApiClient;
  testUser: TestUser;
  home: HomePage;
  login: LoginPage;
  signup: SignupPage;
  products: ProductsPage;
  productDetail: ProductDetailPage;
  cart: CartPage;
  checkout: CheckoutPage;
  payment: PaymentPage;
  contact: ContactPage;
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
  products: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetail: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  payment: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  contact: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from '@playwright/test';
export { request };
