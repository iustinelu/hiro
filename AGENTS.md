# Agent Execution Contract

All implementation agents must follow this contract for every issue.

## Required Before Coding

1. Reference the Linear issue ID in the first implementation update.
2. Confirm dependency order from `docs/architecture-standards.md`.
3. Confirm ticket is in `In Progress` before code changes.

## Required During Implementation

1. Keep all changes within approved repo boundaries.
2. Update docs/checklists when architecture or workflow is touched.
3. Run `npm run check` before handoff.

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
