# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/contact.spec.ts >> Contact Us >> TC6: submit the contact form with a file upload
- Location: tests/web/contact.spec.ts:9:3

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[data-qa="name"]')

```

# Page snapshot

```yaml
- generic [ref=e4]: Please wait while your request is being verified...
```

# Test source

```ts
  1  | import { BasePage } from './base-page.js';
  2  | import type { Locator } from '@playwright/test';
  3  | import { ROUTES } from '../data/constants.js';
  4  | 
  5  | export class ContactPage extends BasePage {
  6  |   readonly name: Locator = this.page.locator('[data-qa="name"]');
  7  |   readonly email: Locator = this.page.locator('[data-qa="email"]');
  8  |   readonly subject: Locator = this.page.locator('[data-qa="subject"]');
  9  |   readonly message: Locator = this.page.locator('[data-qa="message"]');
  10 |   readonly file: Locator = this.page.locator('input[name="upload_file"]');
  11 |   readonly submit: Locator = this.page.locator('[data-qa="submit-button"]');
  12 |   readonly success: Locator = this.page.locator('.status.alert.alert-success');
  13 | 
  14 |   async open(): Promise<void> {
  15 |     await this.goto(ROUTES.contact);
  16 |   }
  17 | 
  18 |   async submitForm(opts: {
  19 |     name: string;
  20 |     email: string;
  21 |     subject: string;
  22 |     message: string;
  23 |     filePath: string;
  24 |   }): Promise<void> {
> 25 |     await this.name.fill(opts.name);
     |                     ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  26 |     await this.email.fill(opts.email);
  27 |     await this.subject.fill(opts.subject);
  28 |     await this.message.fill(opts.message);
  29 |     await this.file.setInputFiles(opts.filePath);
  30 |     // Accept the native confirm() dialog the site triggers on submit.
  31 |     this.page.once('dialog', (d) => d.accept());
  32 |     await this.submit.click();
  33 |   }
  34 | }
  35 | 
```