# v0.1.4 - Tasks board era

Source: founder dogfooding notes on v0.1.3 (2026-07-05) plus the mandate that the Tasks UX/UI comes out 10x better, not incrementally patched.
North star: the Tasks tab becomes the household chore board - opinionated about what to do next, alive with what teammates just did, one tap from doing, and celebratory when you do.

Design rationale, UX diagnosis, and founder decisions are captured in each Linear ticket; briefs here carry the implementation detail for per-item agent dispatch (one agent per brief, own worktree, founder tests then merges).

## Queue

| # | Brief | Ticket | Size | Depends on | Status |
|---|-------|--------|------|------------|--------|
| 01 | [Tasks board redesign](01-tasks-board-redesign.md) | HIR-83 | L | - | todo |
| 02 | [Anytime chores](02-anytime-chores.md) | HIR-84 | M | 01 (UI slot; backend parallel-safe) | todo |
| 03 | [Done log](03-done-log.md) | HIR-85 | M | 01 | todo |
| 04 | [Overdue reminders](04-overdue-reminders.md) | HIR-86 | L | 01 (UI slot; backend parallel-safe), HIR-66 for push delivery | todo |

## Order

1. Brief 01 first - it defines the board layout, the `MobileTaskRow` primitive, and the task detail sheet that 02/03/04 slot into.
2. Briefs 02 and 04 can start their backend + domain work in parallel with 01.
3. Brief 03 starts after 01 merges.

## Shared rules for every brief

- Mobile only (web is parked per the mobile-first decision of 2026-06-27).
- Every themed value must be reactive (useTheme); all 4 themes (aurora, daylight, superchore, neon) pixel-QAd on the emulator harness (`docs/v0.1.3/mobile-qa-harness.md`).
- Agents work in their own worktree and commit there, never in the shared main checkout.
- Fresh worktrees: copy gitignored `.env` files from main, symlink `node_modules` from the main checkout, restart Metro for `EXPO_PUBLIC_*`.
- Migrations: check the live head via `list_migrations` first, version strictly after it, pass `npm run check:migrations`, denial-test every new policy/function grant.
- `npm run check` green before PR; PR via `node scripts/create-pr.mjs`; the `quality` check is the only CI gate.
- Every brief ends with the Founder QA Quick Cycle from its ticket; do not mark Done before founder sign-off.
