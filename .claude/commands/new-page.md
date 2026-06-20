---
description: Scaffold a new page object + register its fixture
---

Create a new page object for the screen named in `$ARGUMENTS`.

1. Create `src/pages/<kebab-name>-page.ts` extending `BasePage`, with intent-level
   methods and `data-qa`/role locators. Confirm selectors with
   `npx playwright codegen https://automationexercise.com`.
2. Register the page as a fixture in `src/fixtures.ts` (add to the `Fixtures` type
   and the `test.extend` object).
3. Run `npm run typecheck` and report the result.
