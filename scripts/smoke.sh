#!/usr/bin/env bash
set -euo pipefail
# Quick sanity: one API spec + the home web smoke test.
npx playwright test --project=api tests/api/products.api.spec.ts
npx playwright test --project=web tests/web/home.spec.ts
echo "Smoke passed."
