import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class ProductDetailPage extends BasePage {
  readonly info: Locator = this.page.locator('.product-information');
  readonly name: Locator = this.page.locator('.product-information h2');
  readonly quantity: Locator = this.page.locator('#quantity');
  readonly addToCart: Locator = this.page.locator('button.cart');

  // Review form
  readonly reviewName: Locator = this.page.locator('#name');
  readonly reviewEmail: Locator = this.page.locator('#email');
  readonly reviewText: Locator = this.page.locator('#review');
  readonly reviewSubmit: Locator = this.page.locator('#button-review');
  readonly reviewSuccess: Locator = this.page.locator('#review-section .alert-success');

  async setQuantity(qty: number): Promise<void> {
    await this.quantity.fill(String(qty));
  }

  async addToCartAndContinue(): Promise<void> {
    await this.addToCart.click();
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async submitReview(name: string, email: string, text: string): Promise<void> {
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewText.fill(text);
    await this.reviewSubmit.click();
  }
}
