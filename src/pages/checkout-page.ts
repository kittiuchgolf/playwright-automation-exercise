import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class CheckoutPage extends BasePage {
  readonly deliveryAddress: Locator = this.page.locator('#address_delivery');
  readonly orderComment: Locator = this.page.locator('textarea[name="message"]');
  readonly placeOrder: Locator = this.page.getByRole('link', { name: 'Place Order' });

  async addComment(text: string): Promise<void> {
    await this.orderComment.fill(text);
  }

  async proceedToPayment(): Promise<void> {
    // On this shared, ad-heavy site an ad iframe in the order-review area
    // intermittently overlaps the "Place Order" link under parallel load, so a
    // single click is swallowed and the link never navigates. Re-click until we
    // actually land on /payment; the trailing waitForURL gives a clear failure
    // if every attempt is dropped.
    await this.placeOrder.scrollIntoViewIfNeeded();
    for (let attempt = 0; attempt < 4 && !this.page.url().includes('/payment'); attempt++) {
      await this.placeOrder.click().catch(() => undefined);
      await this.page.waitForURL('**/payment', { timeout: 6000 }).catch(() => undefined);
    }
    await this.page.waitForURL('**/payment', { timeout: 5000 });
  }
}
