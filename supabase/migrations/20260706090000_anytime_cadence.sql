-- HIR-84: anytime chores (repeatable pool)
--
-- Adds a fourth cadence value 'anytime' to recurring_tasks: chores that need
-- doing sometimes but not on specific days (e.g. take out trash). They are
-- never "due today"; completions flow through the existing complete_task RPC
-- unchanged, so points, leaderboard, streaks, and the undo window all work
-- as-is. cadence_meta stays '{}' for anytime tasks.
--
-- The original constraint was declared inline in
-- 20260404000000_recurring_tasks_and_completions.sql as
-- `check (cadence in ('daily', 'weekly', 'custom'))`, which Postgres
-- auto-named `recurring_tasks_cadence_check` (verified against pg_constraint
-- on the live DB before writing this migration).

alter table public.recurring_tasks
  drop constraint recurring_tasks_cadence_check;

alter table public.recurring_tasks
  add constraint recurring_tasks_cadence_check
  check (cadence in ('daily', 'weekly', 'custom', 'anytime'));
