import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';

export class HomePage extends BasePage {
  readonly featuredItems: Locator = this.page.locator('.features_items .product-image-wrapper');
  readonly subscribeEmail: Locator = this.page.locator('#susbscribe_email'); // site's id (typo intentional)
  readonly subscribeButton: Locator = this.page.locator('#subscribe');
  readonly subscribeSuccess: Locator = this.page.locator('#success-subscribe .alert-success');

  async open(): Promise<void> {
    await this.goto('/');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscribeEmail.fill(email);
    await this.subscribeButton.click();
  }
}
