# 02 - Anytime chores: repeatable pool (HIR-84)

**Ticket:** HIR-84  **Branch:** `hir-84/anytime-chores`  **Worktree:** `../hiro-anytime-chores`
**Platforms:** mobile + Supabase  **Size:** M  **Depends on:** 01 for the board section slot (backend + domain parallel-safe)

## Goal

Chores that need doing sometimes but not on specific days (take out trash).
A standing pool: tap one, it logs a completion + points, and it stays in the pool for next time.
Founder decision: plain repeatable pool, no cooldown/smart-resurfacing in v1.

## Approach

A fourth `recurring_tasks.cadence` value `'anytime'` instead of a new table.
Completions flow through the existing `complete_task` RPC into `task_completions`, so points, leaderboard, streaks, the 5-minute undo window, and the completion push trigger all work unchanged.

## Do

### Migration

- Widen the CHECK constraint on `recurring_tasks.cadence` to `('daily','weekly','custom','anytime')`; `cadence_meta` stays `{}` for anytime.
- Version strictly after the live head: run `list_migrations` on project `pfokfopwjrahclmseper` first (drift gotcha - live DB can be ahead of files).
- No RLS changes, no new RPCs, no new grants.
- `npm run check:migrations` must pass.

### Domain (`packages/domain/src/index.ts` + calc)

- `TaskCadence` union gains `"anytime"`.
- `cadenceLabel` -> "Anytime".
- `isDueToday` returns `false` for anytime (never due, never overdue; brief 04 must exclude them).

### Mobile UI

- Board section **Anytime** (slot from brief 01): pool listed with `MobileTaskRow`, leading complete-circle, one-tap complete with the standard celebration.
- After completing, the item stays; for the rest of the day its meta line reads "done 2h ago by Alex" (from today's completions).
- `TaskCreateModal`: cadence picker gains Anytime with copy "Whenever it needs doing".
- Manage segment shows anytime tasks with the "Anytime" cadence chip.
- Check `apps/mobile/src/lib/taskService.ts` fetches include anytime tasks (they are ordinary recurring_tasks rows).

## Non-goals

Cooldown/"roughly every X days" hints; per-person assignment; web.

## Acceptance

Per HIR-84: pool item never appears in Today; completing awards points and keeps it in the pool; double-completion same day works (two ledger rows); `npm run check` green; 4 themes correct.

## Founder QA Quick Cycle

See HIR-84 for the full block.
Key check: create "Take out trash" as Anytime, complete it twice, verify points both times and the item never leaves the pool.
