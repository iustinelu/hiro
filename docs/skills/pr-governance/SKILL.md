---
name: pr-governance
description: Create or update pull requests in this repository using the mandatory governance template and validation flow. Use whenever preparing a PR body, creating a PR, or remediating PR governance/template failures.
---

# PR Governance

Follow this exact flow for every PR.

## Execute

1. Prepare a fresh body from the repo template.
   - `npm run pr:prepare`
2. Fill `/tmp/pr_body.md` without renaming/removing template sections.
3. Validate body and title before any PR create/update action.
   - `npm run pr:validate -- --file /tmp/pr_body.md --title "HIR-XX: ..."`
4. Create the PR through the guarded wrapper.
   - `npm run pr:create -- --base main --head <branch> --title "HIR-XX: ..." --body-file /tmp/pr_body.md`

## Enforce

- Never call `gh pr create` directly.
- Never create/update a PR body through API/MCP unless the exact body/title pair passed `pr:validate`.
- Keep all compliance checklist items checked (`[x]`) when complete.
- Keep Founder QA Gate and Founder QA Quick Cycle sections present and populated.

## Recover

When an existing PR body fails governance:

1. Regenerate body from template: `npm run pr:prepare`
2. Refill body and validate: `npm run pr:validate -- --file /tmp/pr_body.md --title "HIR-XX: ..."`
3. Update the PR body with the validated text.
