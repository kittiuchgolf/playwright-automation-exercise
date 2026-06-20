import { BasePage } from './base-page.js';
import type { Locator } from '@playwright/test';
import { ROUTES } from '../data/constants.js';

export class LoginPage extends BasePage {
  readonly loginEmail: Locator = this.page.locator('[data-qa="login-email"]');
  readonly loginPassword: Locator = this.page.locator('[data-qa="login-password"]');
  readonly loginButton: Locator = this.page.locator('[data-qa="login-button"]');
  readonly loginError: Locator = this.page.getByText('Your email or password is incorrect!');

  readonly signupName: Locator = this.page.locator('[data-qa="signup-name"]');
  readonly signupEmail: Locator = this.page.locator('[data-qa="signup-email"]');
  readonly signupButton: Locator = this.page.locator('[data-qa="signup-button"]');
  readonly signupError: Locator = this.page.getByText('Email Address already exist!');

  async open(): Promise<void> {
    await this.goto(ROUTES.login);
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }
}
