---
name: branch-pr-lifecycle
description: Manage Hiro branch and PR lifecycle safely from branch creation through merge follow-up. Use when preparing a branch, opening a PR, validating checks, and cleaning up after merge.
---

# Branch PR Lifecycle

Use this lifecycle for every implementation branch.

## Branch

1. Start from updated `main`.
2. Create a dedicated branch using the short format: `hir-{number}/{short-slug}` (e.g. `hir-34/schema-rls`). Never use the auto-generated Linear branch name — it is too long.
3. Keep branch scoped to one ticket or tightly coupled follow-ups.

## Validate

1. Run `npm run check` before PR creation.
2. Ensure governance and PR template requirements are satisfied.

## Create PR

1. Run `npm run pr:prepare`.
2. Fill `/tmp/pr_body.md`.
3. Run `npm run pr:validate -- --file /tmp/pr_body.md --title "HIR-XX: ..."` .
4. Run `npm run pr:create:fallback -- --base main --head <branch> --title "HIR-XX: ..." --body-file /tmp/pr_body.md` only when MCP is unavailable.

## Post-merge

1. Confirm merge completed.
2. Sync local `main`.
3. Create next ticket branch from fresh `main`.
