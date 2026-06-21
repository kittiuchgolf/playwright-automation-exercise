import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class ContactPage extends BasePage {
  readonly name: Locator = this.page.locator('[data-qa="name"]');
  readonly email: Locator = this.page.locator('[data-qa="email"]');
  readonly subject: Locator = this.page.locator('[data-qa="subject"]');
  readonly message: Locator = this.page.locator('[data-qa="message"]');
  readonly file: Locator = this.page.locator('input[name="upload_file"]');
  readonly submit: Locator = this.page.locator('[data-qa="submit-button"]');
  readonly success: Locator = this.page.locator('.status.alert.alert-success');

  async open(): Promise<void> {
    await this.goto(ROUTES.contact);
  }

  async submitForm(opts: {
    name: string;
    email: string;
    subject: string;
    message: string;
    filePath: string;
  }): Promise<void> {
    await this.name.fill(opts.name);
    await this.email.fill(opts.email);
    await this.subject.fill(opts.subject);
    await this.message.fill(opts.message);
    await this.file.setInputFiles(opts.filePath);
    // Accept the native confirm() dialog the site triggers on submit.
    this.page.once('dialog', (d) => d.accept());
    await this.submit.click();
  }
}
