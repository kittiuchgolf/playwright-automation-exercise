import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import type { TestUser } from '../data/users.js';

export class SignupPage extends BasePage {
  readonly accountCreated: Locator = this.page.locator('[data-qa="account-created"]');
  readonly continueButton: Locator = this.page.locator('[data-qa="continue-button"]');

  async fillAccountDetails(u: TestUser): Promise<void> {
    await this.page.locator(u.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.page.locator('[data-qa="password"]').fill(u.password);
    await this.page.locator('[data-qa="days"]').selectOption(u.birthDay);
    await this.page.locator('[data-qa="months"]').selectOption(u.birthMonth);
    await this.page.locator('[data-qa="years"]').selectOption(u.birthYear);
    await this.page.locator('[data-qa="first_name"]').fill(u.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(u.lastName);
    await this.page.locator('[data-qa="company"]').fill(u.company);
    await this.page.locator('[data-qa="address"]').fill(u.address1);
    await this.page.locator('[data-qa="address2"]').fill(u.address2);
    await this.page.locator('[data-qa="country"]').selectOption(u.country);
    await this.page.locator('[data-qa="state"]').fill(u.state);
    await this.page.locator('[data-qa="city"]').fill(u.city);
    await this.page.locator('[data-qa="zipcode"]').fill(u.zipcode);
    await this.page.locator('[data-qa="mobile_number"]').fill(u.mobile);
    await this.page.locator('[data-qa="create-account"]').click();
  }

  async continueAfterCreation(): Promise<void> {
    await this.continueButton.click();
  }
}
