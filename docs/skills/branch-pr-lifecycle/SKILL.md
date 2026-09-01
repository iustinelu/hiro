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

1. Run `npm run check` before PR creation; it must be green.

## Create PR

1. Open the PR with plain `gh pr create --base main --title "HIR-XX: ..."`.
2. The repo PR template pre-fills Summary / What Changed / Founder QA Quick Cycle; fill them in.
3. The `quality` CI check is the only automated gate; founder QA gates the merge.

## Post-merge

1. Confirm merge completed.
2. Sync local `main`.
3. Create next ticket branch from fresh `main`.
