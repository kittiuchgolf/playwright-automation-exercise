import { test, expect } from '../../src/fixtures.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD = path.resolve(__dirname, '../fixtures/upload.txt');

test.describe('Contact Us', () => {
  test('TC6: submit the contact form with a file upload', async ({ contact, testUser }) => {
    await contact.open();
    await contact.submitForm({
      name: testUser.name,
      email: testUser.email,
      subject: 'Automated test enquiry',
      message: 'This is an automated contact-form submission.',
      filePath: UPLOAD,
    });
    await expect(contact.success).toBeVisible();
    await expect(contact.success).toContainText('Success');
  });
});
