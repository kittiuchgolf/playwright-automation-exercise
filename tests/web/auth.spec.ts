import { test, expect } from '../../src/fixtures.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Authentication', () => {
  test('TC1: register a new user and delete account', async ({ login, signup, home, testUser }) => {
    await login.open();
    await login.startSignup(testUser.name, testUser.email);
    await signup.fillAccountDetails(testUser);
    await expect(signup.accountCreated).toBeVisible();
    await signup.continueAfterCreation();
    await expect(home.loggedInAs(testUser.name)).toBeVisible();
    await login.clickDeleteAccount();
    await expect(login.page.locator('[data-qa="account-deleted"]')).toBeVisible();
  });

  test('TC5: register with an existing email shows error', async ({ api, login, testUser }) => {
    // Seed the account via API so the email already exists.
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.startSignup(testUser.name, testUser.email);
      await expect(login.signupError).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC2: login with valid credentials', async ({ api, login, home, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('TC3: login with invalid credentials shows error', async ({ login }) => {
    await login.open();
    await login.login('no-such-user@nope.test', 'wrongpass');
    await expect(login.loginError).toBeVisible();
  });

  test('TC4: logout after login', async ({ api, login, home, testUser }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      await login.open();
      await login.login(testUser.email, testUser.password);
      await expect(home.loggedInAs(testUser.name)).toBeVisible();
      await login.clickLogout();
      await expect(login.loginButton).toBeVisible();
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });
});
