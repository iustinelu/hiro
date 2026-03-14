---
name: linear-implementation-flow
description: Execute Hiro implementation tickets with required Linear + architecture workflow. Use when starting or progressing any HIR implementation issue to enforce ticket state, dependency order checks, and mandatory handoff structure.
---

# Linear Implementation Flow

Follow this flow for every implementation ticket.

## Start

1. Reference the Linear issue ID in the first implementation update.
2. Confirm dependency order from `docs/architecture-standards.md`.
3. Confirm ticket status is `In Progress` before code changes.
4. **Re-read all guardrail docs** (`docs/architecture-standards.md`, `supabase/README.md`, relevant skill docs).
5. **Explore all codebase areas the ticket touches** — read existing files, check package APIs.
6. **Write and present a complete plan** (files, decisions, constraints, QA strategy) and wait for approval before implementing.

## Implement

1. Keep all edits within approved repo boundaries.
2. Update docs/checklists when architecture or workflow changes.
3. Run `npm run check` before handoff.

## Handoff

1. Include Linear issue ID.
2. Include checklist completion status.
3. Include `npm run check` command results.
4. State explicit founder QA stop-point; do not mark `Done`.
5. Include Founder QA Quick Cycle with:
   - Commands
   - Validate
   - Look for
   - Pass/Fail
