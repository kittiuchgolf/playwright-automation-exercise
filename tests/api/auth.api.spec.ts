import { test, expect } from '../../src/fixtures.js';
import { MESSAGES } from '../../src/data/constants.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('verifyLogin API', () => {
  // A real account is needed for the "valid" case. Create via API, delete after.
  test('API 7: verifyLogin with valid credentials returns "User exists!"', async ({
    api,
    testUser,
  }) => {
    const created = await api.createAccount(toAccountPayload(testUser));
    expect(created.body.responseCode).toBe(201);
    try {
      const { status, body } = await api.verifyLogin(testUser.email, testUser.password);
      expect(status).toBe(200);
      expect(body.responseCode).toBe(200);
      expect(body.message).toBe(MESSAGES.userExists);
    } finally {
      await api.deleteAccount(testUser.email, testUser.password);
    }
  });

  test('API 8: verifyLogin without email returns 400', async ({ api }) => {
    const { status, body } = await api.verifyLoginMissingEmail('whatever');
    expect(status).toBe(200);
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe(MESSAGES.loginParamMissing);
  });

  test('API 9: DELETE verifyLogin is not supported (405)', async ({ api }) => {
    const { status, body } = await api.deleteVerifyLogin();
    expect(status).toBe(200);
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe(MESSAGES.methodNotSupported);
  });

  test('API 10: verifyLogin with invalid credentials returns "User not found!"', async ({
    api,
  }) => {
    const { status, body } = await api.verifyLogin('does-not-exist@nope.test', 'wrongpass');
    expect(status).toBe(200);
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe(MESSAGES.userNotFound);
  });
});
