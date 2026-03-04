# PR Governance Skill

Purpose: create and update pull requests without violating repository governance rules.

## When to use

- Any time you are creating a PR
- Any time you are editing a PR body

## Required flow

1. Prepare body from template:
   - `npm run pr:prepare`
2. Edit `/tmp/pr_body.md` and keep all template section headers exactly.
3. Validate body/title:
   - `npm run pr:validate -- --file /tmp/pr_body.md --title "HIR-XX: ..."`
4. Create PR using the guarded wrapper:
   - `npm run pr:create -- --base main --head <branch> --title "HIR-XX: ..." --body-file /tmp/pr_body.md`

## Rules

- Never call `gh pr create` directly.
- Never create a PR via API/MCP with a body that has not passed `pr:validate`.
- Keep checklist items checked (`[x]`) when complete.
- Include Founder QA Gate and Founder QA Quick Cycle fields exactly.

## Recovery

If a PR already exists with a non-compliant body:

1. Regenerate body from template using `npm run pr:prepare`
2. Fill details and validate with `npm run pr:validate`
3. Update PR body with the validated content
