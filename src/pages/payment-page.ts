import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { PAYMENT_CARD } from '../data/constants.js';

export class PaymentPage extends BasePage {
  readonly orderPlaced: Locator = this.page
    .locator('[data-qa="order-placed"], .alert-success')
    .first();

  async pay(): Promise<void> {
    await this.page.locator('[data-qa="name-on-card"]').fill(PAYMENT_CARD.nameOnCard);
    await this.page.locator('[data-qa="card-number"]').fill(PAYMENT_CARD.cardNumber);
    await this.page.locator('[data-qa="cvc"]').fill(PAYMENT_CARD.cvc);
    await this.page.locator('[data-qa="expiry-month"]').fill(PAYMENT_CARD.expiryMonth);
    await this.page.locator('[data-qa="expiry-year"]').fill(PAYMENT_CARD.expiryYear);
    await this.page.locator('[data-qa="pay-button"]').click();
  }
}
