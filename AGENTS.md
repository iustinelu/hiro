# Agent Execution Contract

All implementation agents must follow this contract for every issue.

**Current state (2026-07):** Hiro is a **mobile-only** product (Expo, `apps/mobile`), distributed natively via EAS to Play internal track + TestFlight.
The web app has been retired; its history lives in git.
For the freshest session-to-session state, read `docs/next-chat-handoff.md` first.

---

## Core Ethos: Founder Time Is the Scarcest Resource

**Agent time is infinite. Founder time is not.**

This ethos applies to every line of code, every PR, every handoff — not just schema work.

Every decision, output, and handoff must be optimized for founder time. The standard is:

- **Zero rework loops.** If an agent produces something the founder must chase down, correct, or repair, the agent has failed — even if the output was "technically correct." Own the outcome, not just the attempt.
- **No mediocre solutions.** "You're right, let me try again" is not acceptable. Think it through fully before acting. If blocked or uncertain, surface one crisp, bounded question — not a list of maybes. Never say "you're right" and offer a worse version.
- **Precision over speed.** Doing it right once beats doing it fast and requiring a repair loop. Agents have unlimited retries; founders do not. A founder stuck debugging agent output is the worst possible outcome.
- **Laser-focused scope.** Only change what the ticket requires. No bonus refactors, no "while I'm here" changes. Unnecessary surface area creates unnecessary QA burden.
- **Verify everything irreversible.** For schema, RLS, infra, and config changes: read before touching, apply, then prove correctness with queries/tests before closing. Never assume it worked.

**Specific obligations for schema and RLS work (highest-risk category):**

1. Read every migration file in full before applying or modifying anything.
2. Verify applied migrations match the file exactly — use `list_migrations` and `execute_sql` checks after applying.
3. Confirm RLS is enabled on every household-scoped table after applying.
4. Confirm policy count and semantics match spec before closing the ticket.
5. Never assume a migration "probably worked" — prove it with a query.
6. When in doubt about a policy's correctness, write a denial test and run it.

**This is non-negotiable. A founder spending time in repair loops because an agent cut corners is the worst possible outcome.**

---

## Required Before Coding

1. Reference the Linear issue ID in the first implementation update.
2. Confirm dependency order from `docs/architecture-standards.md`.
3. Confirm ticket is in `In Progress` before code changes.

## Required During Implementation

1. Keep all changes within approved repo boundaries.
2. Update docs/checklists when architecture or workflow is touched.
3. Run `npm run check` before handoff.
4. Use design-system primitives/tokens for all app UI elements; avoid raw platform interactive elements in `apps/*`.
5. If required UI is missing from design system, implement it in `packages/ui-primitives` first, then consume it from apps. Hiro is mobile-only; primitives target React Native.

## Required In Final Handoff

1. Include the Linear issue ID.
2. Include checklist completion status.
3. Include command results for `npm run check`.
4. State explicit founder QA stop-point; do not mark `Done`.
5. Include a **Founder QA Quick Cycle** with exact commands, where to validate, and pass/fail cues.

Founder QA Quick Cycle format (mandatory):

- Commands: exact terminal commands to run (copy/paste ready).
- Validate: exact route/screen/component or flow to open.
- Look for: concise visual/behavior checks.
- Pass/Fail: explicit criteria to decide quickly.

## Prohibited

1. Closing implementation issues without founder QA sign-off.
2. Skipping compliance checklist items without documented emergency deviation.

## PR Workflow

The PR flow is deliberately lightweight (the old PR-governance template gate was scrapped in 2026-06, commit `f8fece0`):

1. Branch from updated `main` using `hir-{number}/{short-slug}` (or `chore/{slug}` for non-ticket work).
2. Run `npm run check` and get it green before opening a PR.
3. Open the PR with plain `gh pr create`. The template pre-fills Summary / What Changed / Founder QA Quick Cycle; fill them in.
4. The `quality` CI check is the only automated gate.
5. Founder QA gates the merge; do not merge without founder sign-off unless the founder pre-authorized it for the session.

## Repository Skills (Mandatory)

Use these repository skills when their triggers apply:

1. `docs/skills/linear-implementation-flow/SKILL.md` for all HIR implementation tickets.
2. `docs/skills/founder-qa-handoff/SKILL.md` for all final ticket/PR handoffs.
3. `docs/skills/branch-pr-lifecycle/SKILL.md` for branch creation, PR creation, merge follow-up.
4. `docs/skills/design-system-change-gate/SKILL.md` for any design-system/tokens/primitives changes.
