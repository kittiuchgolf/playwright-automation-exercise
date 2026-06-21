import { test, expect } from '../../src/fixtures.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Checkout', () => {
  test('TC16: login before checkout, place order', async ({
    api,
    login,
    home,
    products,
    productDetail,
    cart,
    checkout,
    payment,
    testUser,
  }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();

      await products.open();
      await products.viewProduct(0);
      await productDetail.addToCartAndContinue();
      await cart.open();
      await cart.proceedToCheckout.click();

      await checkout.addComment('Please deliver fast.');
      await checkout.proceedToPayment();
      await payment.pay();
      await expect(payment.orderPlaced).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC23: verify delivery address matches the registered user', async ({
    api,
    login,
    home,
    products,
    productDetail,
    cart,
    checkout,
    testUser,
  }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();

      await products.open();
      await products.viewProduct(0);
      await productDetail.addToCartAndContinue();
      await cart.open();
      await cart.proceedToCheckout.click();

      await expect(checkout.deliveryAddress).toContainText(testUser.firstName);
      await expect(checkout.deliveryAddress).toContainText(testUser.city);
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC14: register while checkout, place order', async ({
    login,
    signup,
    home,
    products,
    productDetail,
    cart,
    checkout,
    payment,
    testUser,
  }) => {
    await products.open();
    await products.viewProduct(0);
    await productDetail.addToCartAndContinue();
    await cart.open();
    await cart.proceedToCheckout.click();

    // Not logged in -> modal offers register/login
    await cart.page.getByRole('link', { name: /Register \/ Login/i }).click();
    await login.startSignup(testUser.name, testUser.email);
    await signup.fillAccountDetails(testUser);
    await expect(signup.accountCreated).toBeVisible();
    await signup.continueAfterCreation();
    await expect(home.loggedInAs(testUser.name)).toBeVisible();

    await cart.open();
    await cart.proceedToCheckout.click();
    await checkout.addComment('Registered at checkout.');
    await checkout.proceedToPayment();
    await payment.pay();
    await expect(payment.orderPlaced).toBeVisible();

    await login.clickDeleteAccount();
    await expect(login.page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });
});
