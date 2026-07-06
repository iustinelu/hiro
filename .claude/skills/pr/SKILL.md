---
name: pr
description: Create or manage a pull request. Delegates to the canonical project skills.
---

# PR Workflow

1. Run `npm run check` from the repo root; it must be green before opening a PR.
2. Open the PR with plain `gh pr create` (the repo template pre-fills Summary / What Changed / Founder QA Quick Cycle - fill them in).
3. The `quality` CI check is the only automated gate.
4. Founder QA gates the merge.

Follow `docs/skills/branch-pr-lifecycle/SKILL.md` for branch naming and post-merge steps.
