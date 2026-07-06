-- HIR-86: overdue recurring tasks - detection + reminders
--
-- Two daily sweeps over recurring_tasks, driven by pg_cron:
--   * detect_overdue_recurring_tasks(): tasks due YESTERDAY with no completion
--     on that date -> one 'task_overdue' notification_outbox row per household
--     member, plus ONE 'task_missed' household_activity feed event per task.
--   * nudge_open_recurring_tasks(): tasks due TODAY, still uncompleted -> one
--     'task_due_reminder' outbox row per member (no feed event).
--
-- Timezone: SINGLE-MARKET ASSUMPTION. Hiro currently ships to one market, so
-- "yesterday"/"today" and day-of-week are computed in one named constant
-- timezone (Europe/Amsterdam) inside both functions. When households grow a
-- timezone column, thread it through here instead of the constant.
--
-- Cadence semantics mirror the mobile client (apps/mobile/src/lib/taskService.ts
-- isDueToday, and packages/domain/src/calc.ts computeMissedDueDates), INCLUDING
-- the client's full-name-vs-abbreviation inconsistency:
--   daily  -> due every day
--   weekly -> cadence_meta.day holds a FULL lowercase day name ('monday')
--   custom -> cadence_meta.days holds 3-letter lowercase abbreviations ('mon')
--   anything else (e.g. the incoming 'anytime' cadence) -> never due, never
--   overdue - the explicit cadence IN list future-proofs against new values.
--
-- Idempotency: both sweeps existence-check notification_outbox on
-- event_type + data->>'task_id' + data->>'due_date' (and the overdue sweep
-- additionally checks household_activity for a same-task same-due-date
-- 'task_missed' row), so re-running within the same day adds nothing.
--
-- Delivery dependency: outbox rows accumulate as 'pending' until the HIR-66
-- push pipeline goes live (send-push deploy + APNs/FCM + webhook); nothing
-- here blocks on that.

-- ─── household_activity: allow the 'task_missed' feed kind ──────────────────

alter table public.household_activity
  drop constraint household_activity_kind_check;

alter table public.household_activity
  add constraint household_activity_kind_check check (kind in (
    'task_completed',
    'one_off_posted',
    'one_off_logged',
    'one_off_claimed',
    'one_off_completed',
    'one_off_contested',
    'one_off_contest_withdrawn',
    'one_off_settled',
    'one_off_reverted',
    'reward_redeemed',
    'member_joined',
    'member_left',
    'task_missed'
  ));

-- ─── detect_overdue_recurring_tasks (morning sweep) ──────────────────────────

-- Returns the number of tasks that got a NEW overdue notification set (0 on an
-- idempotent re-run), which makes manual verification runs self-evident.
create or replace function public.detect_overdue_recurring_tasks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  c_tz constant text := 'Europe/Amsterdam';
  v_due_date date;
  v_day_full text; -- full lowercase day name, e.g. 'sunday' (weekly meta format)
  v_day_abbr text; -- 3-letter lowercase abbreviation, e.g. 'sun' (custom meta format)
  v_task record;
  v_notified integer := 0;
begin
  v_due_date := (now() at time zone c_tz)::date - 1;
  v_day_full := trim(to_char(v_due_date, 'day'));
  v_day_abbr := trim(to_char(v_due_date, 'dy'));

  for v_task in
    select t.id, t.household_id, t.name, t.points, t.created_by_profile_id
    from public.recurring_tasks t
    where not t.is_archived
      and (
        t.cadence = 'daily'
        or (t.cadence = 'weekly' and t.cadence_meta->>'day' = v_day_full)
        or (t.cadence = 'custom' and (t.cadence_meta->'days') ? v_day_abbr)
      )
      and not exists (
        select 1
        from public.task_completions tc
        where tc.task_id = t.id
          and (tc.completed_at at time zone c_tz)::date = v_due_date
      )
  loop
    -- Dedupe guard: at most one overdue notification set per task per due date.
    if not exists (
      select 1
      from public.notification_outbox o
      where o.event_type = 'task_overdue'
        and o.data->>'task_id' = v_task.id::text
        and o.data->>'due_date' = v_due_date::text
    ) then
      insert into public.notification_outbox (recipient_profile_id, title, body, data, event_type)
      select
        hm.profile_id,
        'Still up for grabs',
        v_task.name || ' slipped by yesterday - ' || v_task.points || ' pts still up for grabs',
        jsonb_build_object(
          'event_type', 'task_overdue',
          'household_id', v_task.household_id,
          'task_id', v_task.id,
          'due_date', v_due_date
        ),
        'task_overdue'
      from public.household_members hm
      where hm.household_id = v_task.household_id;

      v_notified := v_notified + 1;
    end if;

    -- One feed event per task per due date. Guarded independently of the outbox
    -- check so a partial past run self-heals. No natural actor exists for a
    -- system-detected miss; the task creator stands in (column is NOT NULL).
    if not exists (
      select 1
      from public.household_activity ha
      where ha.kind = 'task_missed'
        and ha.ref_id = v_task.id
        and ha.metadata->>'due_date' = v_due_date::text
    ) then
      perform public.emit_household_event(
        v_task.household_id,
        v_task.created_by_profile_id,
        'task_missed',
        null,
        v_task.id,
        jsonb_build_object('task_name', v_task.name, 'due_date', v_due_date)
      );
    end if;
  end loop;

  return v_notified;
end;
$$;

-- Cron/definer-only. NB: Supabase default privileges auto-grant EXECUTE on new
-- public functions to anon/authenticated - revoking from PUBLIC alone is NOT
-- enough, revoke the role grants explicitly. The pg_cron job runs as postgres
-- (the scheduling role) and is unaffected.
revoke all on function public.detect_overdue_recurring_tasks() from public;
revoke execute on function public.detect_overdue_recurring_tasks() from anon, authenticated;

-- ─── nudge_open_recurring_tasks (evening sweep) ──────────────────────────────

-- Same shape for tasks due TODAY and still uncompleted. Outbox only - an open
-- task is not feed-worthy. Returns the number of tasks newly nudged.
create or replace function public.nudge_open_recurring_tasks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  c_tz constant text := 'Europe/Amsterdam';
  v_due_date date;
  v_day_full text;
  v_day_abbr text;
  v_task record;
  v_notified integer := 0;
begin
  v_due_date := (now() at time zone c_tz)::date;
  v_day_full := trim(to_char(v_due_date, 'day'));
  v_day_abbr := trim(to_char(v_due_date, 'dy'));

  for v_task in
    select t.id, t.household_id, t.name, t.points
    from public.recurring_tasks t
    where not t.is_archived
      and (
        t.cadence = 'daily'
        or (t.cadence = 'weekly' and t.cadence_meta->>'day' = v_day_full)
        or (t.cadence = 'custom' and (t.cadence_meta->'days') ? v_day_abbr)
      )
      and not exists (
        select 1
        from public.task_completions tc
        where tc.task_id = t.id
          and (tc.completed_at at time zone c_tz)::date = v_due_date
      )
  loop
    -- Dedupe guard: at most one nudge per task per due date.
    if not exists (
      select 1
      from public.notification_outbox o
      where o.event_type = 'task_due_reminder'
        and o.data->>'task_id' = v_task.id::text
        and o.data->>'due_date' = v_due_date::text
    ) then
      insert into public.notification_outbox (recipient_profile_id, title, body, data, event_type)
      select
        hm.profile_id,
        'Friendly nudge',
        'Still on today''s list: ' || v_task.name,
        jsonb_build_object(
          'event_type', 'task_due_reminder',
          'household_id', v_task.household_id,
          'task_id', v_task.id,
          'due_date', v_due_date
        ),
        'task_due_reminder'
      from public.household_members hm
      where hm.household_id = v_task.household_id;

      v_notified := v_notified + 1;
    end if;
  end loop;

  return v_notified;
end;
$$;

revoke all on function public.nudge_open_recurring_tasks() from public;
revoke execute on function public.nudge_open_recurring_tasks() from anon, authenticated;

-- ─── pg_cron schedules ────────────────────────────────────────────────────────

-- pg_cron runs in UTC. Both functions compute their date boundaries in
-- Europe/Amsterdam internally, so the cron time only affects the delivery hour:
--   07:00 UTC = 09:00 CEST (summer) / 08:00 CET (winter)  - overdue sweep
--   16:00 UTC = 18:00 CEST (summer) / 17:00 CET (winter)  - evening nudge
-- Fixed UTC times drift one hour across DST; acceptable for a daily reminder,
-- and never wrong about WHICH date is overdue.
-- Idempotent: cron.schedule upserts by jobname, so re-applying is safe.
-- (pg_cron extension already installed by 20260627112916_schedule_expire_stale_invites.sql.)

select cron.schedule(
  'overdue-recurring-tasks',
  '0 7 * * *',
  $$ select public.detect_overdue_recurring_tasks(); $$
);

select cron.schedule(
  'nudge-open-tasks',
  '0 16 * * *',
  $$ select public.nudge_open_recurring_tasks(); $$
);
