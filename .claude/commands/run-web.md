---
description: Run the web (UI) Playwright suite, optionally filtered by a grep pattern
---

Run the web test project. If `$ARGUMENTS` is provided, pass it as a `-g` grep filter.

Run: `npx playwright test --project=web ${ARGUMENTS:+-g "$ARGUMENTS"}`

Then summarize pass/fail counts and, if anything failed, the failing test names and the first assertion error for each. Distinguish a real failure (fails consistently) from a live-site flake (fails once, passes on retry).
