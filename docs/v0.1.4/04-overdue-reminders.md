# 04 - Overdue recurring tasks: detection + reminders (HIR-86)

**Ticket:** HIR-86  **Branch:** `hir-86/overdue-reminders`  **Worktree:** `../hiro-overdue-reminders`
**Platforms:** mobile + Supabase  **Size:** L  **Depends on:** 01 for the Missed UI slot (backend parallel-safe); HIR-66 go-live for actual push delivery (do not block on it)

## Goal

"Forgot to water plants Sunday" must surface: in-app Missed section plus push reminders through the existing outbox.
Two moments: a same-evening nudge for tasks still open today, and a next-morning overdue notice for tasks that were missed.

## Do

### Migration (one file; version after live head via `list_migrations`)

- Extend `household_activity.kind` CHECK with `task_missed`.
- **`detect_overdue_recurring_tasks()`** SECURITY DEFINER:
  - For each active non-archived recurring task due yesterday per `cadence`/`cadence_meta` with no `task_completions` row for that date.
  - Exclude `cadence = 'anytime'` (brief 02) - never due, never overdue.
  - Enqueue one `notification_outbox` row per household member: `event_type = 'task_overdue'`, title/body per copy below, `data` containing task id + due date.
  - Emit one `task_missed` event via `emit_household_event` (points_delta null, ref_id = task id, metadata with due date).
- **`nudge_open_recurring_tasks()`** SECURITY DEFINER: tasks due today, still uncompleted -> one `event_type = 'task_due_reminder'` outbox row per member.
- **Dedupe guard:** never more than one overdue and one nudge notification per task per due-date; existence-check the outbox on `event_type` + task id + due date in `data` (or add a dedicated unique key if cleaner).
- **pg_cron** (precedent `20260627112916_schedule_expire_stale_invites.sql`): overdue sweep daily 09:00, nudge daily 18:00, Europe/Amsterdam.
  - Single-market assumption: household tz = Europe/Amsterdam via one named constant in the sweep fns; document it in the migration header.
  - pg_cron runs in UTC; convert (09:00 CEST = 07:00 UTC in summer - pick fixed UTC times and note the DST tradeoff, or compute date boundaries inside the fn using the tz constant so cron time only affects delivery hour).
- **Grants:** `revoke execute ... from anon, authenticated` on both sweeps (Supabase default-grant gotcha); they are cron/definer-only.
- **Tests:** RLS denial test (`set local role anon`) for anything new; `npm run check:migrations` green.

### Copy (encouraging, never shaming)

- Overdue: "Water plants slipped by yesterday - 15 pts still up for grabs".
- Nudge: "Still on today's list: water plants".

### Mobile UI

- **Missed group** at the top of the board's Today section (slot from brief 01): amber/warning tone (theme status tokens), NOT red.
- Row meta: "was due Sunday"; action = the normal complete-circle, which logs a completion dated today via `complete_task` and clears the row.
- Client derivation mirrors the sweep rule: due dates within a 7-day lookback, uncompleted, excluding anytime.
- Tab badge count on the Tasks icon for missed items if cheap; skip if it fights the tab design.

### Push delivery dependency

- Delivery needs HIR-66 go-live (APNs key, FCM, `supabase functions deploy send-push --no-verify-jwt`, outbox INSERT webhook) - founder-gated ops per `docs/v0.1.3/push-notifications-ops.md`.
- Everything in this brief lands and works now (outbox rows, activity events, Missed UI); pushes start flowing the moment HIR-66 goes live.

## Non-goals

Per-person assignment/escalation; notification preferences UI; smart scheduling for anytime chores.

## Acceptance

Per HIR-86: manual sweep run produces exactly one outbox row per member + one `task_missed` event, idempotent on re-run; nudge sweep same for due-today; Missed UI amber + complete-now works; denial tests pass; correct across daily/weekly/custom cadences with no timezone off-by-one.

## Founder QA Quick Cycle

See HIR-86 for the full block.
Key check: seed a weekly task due yesterday, run `select detect_overdue_recurring_tasks();` twice, verify one notification set and one Missed row, then complete it from the board.
