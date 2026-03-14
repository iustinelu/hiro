---
name: ticket
description: Implement a Linear ticket end-to-end. Delegates to the canonical project skill.
---

# Implement Ticket

Follow `docs/skills/linear-implementation-flow/SKILL.md` exactly.

Before starting, also check `docs/skills/branch-pr-lifecycle/SKILL.md` for branch creation rules — branch from the unmerged dependency branch if one exists, not from main.

## Mandatory Pre-Implementation Protocol

**Every new session starts cold. Re-establish full context before writing a single line of code.**

### 1. Re-read architecture and guardrails (every session, without exception)

- `docs/architecture-standards.md` — boundaries, layering, RLS rules, compliance checklist
- `supabase/README.md` — migration precision mandate and naming conventions
- `docs/skills/linear-implementation-flow/SKILL.md` — handoff format
- `docs/skills/branch-pr-lifecycle/SKILL.md` — branch and PR rules
- `.github/PULL_REQUEST_TEMPLATE.md` — exact required sections and checklist items (governance check will fail if any are missing or unchecked)
- `docs/architecture/founder-qa-workflow.md` — Founder QA Quick Cycle format (Commands / Validate / Look for / Pass/Fail)

### 2. Explore the relevant codebase areas

Before planning, read/explore:
- All existing files that the ticket will touch or extend
- The packages the ticket imports from (check their public API)
- Any existing patterns to follow (e.g. existing migrations, service files, error boundaries)

### 3. Present a complete implementation plan — BEFORE touching code

Write out the full plan with:
- Every file to create or modify (with justification)
- Every architectural decision (where does X live and why)
- Any constraints or blockers (e.g. "events can't be tested until auth exists in HIR-36")
- QA strategy: exact steps to verify each acceptance criterion

**Wait for founder acknowledgment before implementing.** The founder's time to review post-hoc mistakes is the scarcest resource. Getting it right on the first pass is always worth the extra planning time.
