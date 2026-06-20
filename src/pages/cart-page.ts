import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class CartPage extends BasePage {
  readonly rows: Locator = this.page.locator('#cart_info_table tbody tr');
  readonly proceedToCheckout: Locator = this.page.getByText('Proceed To Checkout');

  async open(): Promise<void> {
    await this.goto(ROUTES.cart);
  }

  rowFor(productId: number): Locator {
    return this.page.locator(`#product-${productId}`);
  }

  quantityFor(productId: number): Locator {
    return this.rowFor(productId).locator('.cart_quantity button');
  }

  async removeRow(productId: number): Promise<void> {
    await this.rowFor(productId).locator('.cart_quantity_delete').click();
  }
}
