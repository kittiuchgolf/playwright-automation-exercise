import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class ProductsPage extends BasePage {
  readonly allProducts: Locator = this.page.locator('.features_items .product-image-wrapper');
  readonly searchInput: Locator = this.page.locator('#search_product');
  readonly searchButton: Locator = this.page.locator('#submit_search');
  readonly searchedProductsTitle: Locator = this.page.getByRole('heading', {
    name: 'Searched Products',
  });

  async open(): Promise<void> {
    await this.goto(ROUTES.products);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async viewProduct(index: number): Promise<void> {
    await this.allProducts.nth(index).getByRole('link', { name: 'View Product' }).click();
  }

  async expandCategory(parent: string): Promise<void> {
    await this.page.locator('#accordian').getByRole('link', { name: parent }).click();
  }

  async selectSubCategory(sub: string): Promise<void> {
    await this.page.locator('.panel-collapse.in').getByRole('link', { name: sub }).click();
  }

  async selectBrand(brand: string): Promise<void> {
    await this.page
      .locator('.brands_products')
      .getByRole('link', { name: new RegExp(brand) })
      .click();
  }
}
