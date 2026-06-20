import { test, expect } from '../../src/fixtures.js';
import { MESSAGES } from '../../src/data/constants.js';
import { toAccountPayload } from '../../src/data/users.js';

test.describe('Account lifecycle API (create → read → update → delete)', () => {
  test('APIs 11/14/13/12: full account lifecycle', async ({ api, testUser }) => {
    const payload = toAccountPayload(testUser);

    // API 11 — create
    const created = await api.createAccount(payload);
    expect(created.status).toBe(200);
    expect(created.body.responseCode).toBe(201);
    expect(created.body.message).toBe(MESSAGES.userCreated);

    try {
      // API 14 — read back
      const detail = await api.getUserDetailByEmail(testUser.email);
      expect(detail.body.responseCode).toBe(200);
      expect(detail.body.user.email).toBe(testUser.email);
      expect(detail.body.user.name).toBe(testUser.name);

      // API 13 — update (change city)
      const updatedPayload = { ...payload, city: 'Updated City' };
      const updated = await api.updateAccount(updatedPayload);
      expect(updated.body.responseCode).toBe(200);
      expect(updated.body.message).toBe(MESSAGES.userUpdated);

      const afterUpdate = await api.getUserDetailByEmail(testUser.email);
      expect(afterUpdate.body.user.city).toBe('Updated City');
    } finally {
      // API 12 — delete (cleanup, also asserted)
      const deleted = await api.deleteAccount(testUser.email, testUser.password);
      expect(deleted.body.responseCode).toBe(200);
      expect(deleted.body.message).toBe(MESSAGES.accountDeleted);
    }
  });
});
