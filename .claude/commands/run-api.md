---
description: Run the API Playwright suite, optionally filtered by a grep pattern
---

Run the api test project. If `$ARGUMENTS` is provided, pass it as a `-g` grep filter.

Run: `npx playwright test --project=api ${ARGUMENTS:+-g "$ARGUMENTS"}`

Remember: assertions are on `body.responseCode` + `body.message`, not the HTTP status. If a test fails, print the actual response body before proposing a fix.
