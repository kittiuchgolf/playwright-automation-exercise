import type { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissConsentIfPresent();
  }

  /** automationexercise shows Google ad consent / ad iframes; ignore gracefully. */
  async dismissConsentIfPresent(): Promise<void> {
    const consent = this.page.getByRole('button', { name: /consent|agree|accept/i }).first();
    if (await consent.isVisible().catch(() => false)) {
      await consent.click().catch(() => undefined);
    }
  }

  async clickSignupLogin(): Promise<void> {
    await this.page.getByRole('link', { name: ' Signup / Login' }).click();
  }

  async clickLogout(): Promise<void> {
    await this.page.getByRole('link', { name: ' Logout' }).click();
  }

  async clickDeleteAccount(): Promise<void> {
    await this.page.getByRole('link', { name: ' Delete Account' }).click();
  }

  loggedInAs(name: string): Locator {
    return this.page.getByText(`Logged in as ${name}`);
  }
}
