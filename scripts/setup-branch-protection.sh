#!/usr/bin/env bash
# Apply branch protection to master:
#   - require the `quality-gate` status check (strict / up-to-date)
#   - require a PR to merge (no direct pushes), with 0 required approvals
#     (solo repo: >0 approvals + enforce_admins would deadlock merges)
#   - enforce on admins too; linear history; no force-push / deletion
# Idempotent — safe to re-run. Prereq: `gh auth login` succeeded, and the
# `quality-gate` check has run at least once on a PR so GitHub knows the name.
set -euo pipefail

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "Applying branch protection to ${REPO}:master ..."

gh api -X PUT "repos/${REPO}/branches/master/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["quality-gate"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Done. Required status checks now:"
gh api "repos/${REPO}/branches/master/protection" --jq '.required_status_checks.contexts'
