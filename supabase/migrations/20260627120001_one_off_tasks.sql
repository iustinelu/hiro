-- HIR-70 / HIR-67: one-off (ad-hoc) tasks + claim + contest/settle flow.
--
-- One-off tasks are intentionally a separate table from recurring_tasks: they
-- have no cadence and a completely different lifecycle (post -> claim ->
-- complete -> settle/contest/revert). Self-assigned points have NO upper cap
-- (founder decision); the contest/settle flow is the only check.
--
-- Settlement rule (founder decision: "auto-revert on timeout"):
--   completed -> (24h window) -> settled  (points finalize into task_completions)
--   completed -> contested -> (24h window) -> reverted (points voided)
-- A contest may be withdrawn before the window closes ("resolved in window").
--
-- There is NO cron dependency: settlement is performed lazily by
-- settle_due_one_off_tasks(household_id), which the clients call on screen load.

-- ─── one_off_tasks Table ─────────────────────────────────────────────────────

create table public.one_off_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  description text,
  points integer not null check (points >= 1),
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  -- 'backlog' = claimable chore posted for anyone (HIR-67);
  -- 'log'     = "I just did this", self-logged as already done (HIR-70).
  kind text not null check (kind in ('backlog', 'log')),
  status text not null check (status in (
    'open', 'claimed', 'completed', 'contested', 'settled', 'reverted'
  )),
  claimed_by_profile_id uuid references public.profiles(id) on delete set null,
  claimed_at timestamptz,
  completed_by_profile_id uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  settle_at timestamptz,
  contested_by_profile_id uuid references public.profiles(id) on delete set null,
  contested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backlog listing + status filters per household.
create index idx_one_off_tasks_household_status
  on public.one_off_tasks(household_id, status);

-- Lazy-settle sweep: find due rows fast.
create index idx_one_off_tasks_household_settle
  on public.one_off_tasks(household_id, settle_at);

alter table public.one_off_tasks enable row level security;

-- ─── one_off_tasks RLS Policies ──────────────────────────────────────────────

-- Members can read all one-off tasks in their household.
create policy one_off_tasks_select
on public.one_off_tasks for select
using (household_id in (select public.current_household_ids()));

-- Fallback insert policy (RPC is SECURITY DEFINER and validates membership;
-- this mirrors recurring_tasks and keeps direct inserts member-scoped).
create policy one_off_tasks_insert
on public.one_off_tasks for insert
with check (
  household_id in (select public.current_household_ids())
  and created_by_profile_id = public.current_profile_id()
);

-- No update/delete policies: all transitions go through the SECURITY DEFINER
-- RPCs below (which bypass RLS), so status can't be mutated client-side.

-- ─── task_completions ledger extension ───────────────────────────────────────
--
-- Settled one-off points fold into the SAME ledger that drives the leaderboard,
-- personal stats, streaks, and the reward balance. This keeps a single source
-- of truth for "points earned" so every existing reader includes ad-hoc points
-- with no change. task_id XOR one_off_task_id identifies the source.

alter table public.task_completions
  alter column task_id drop not null;

alter table public.task_completions
  add column one_off_task_id uuid references public.one_off_tasks(id) on delete restrict;

alter table public.task_completions
  add constraint task_completions_source_chk
  check ((task_id is not null) <> (one_off_task_id is not null));

-- ─── create_one_off_task RPC ─────────────────────────────────────────────────
-- p_kind: 'backlog' (posted open for claiming) or 'log' (self-logged as done).

create or replace function public.create_one_off_task(
  p_household_id uuid,
  p_name text,
  p_points integer,
  p_description text default null,
  p_kind text default 'backlog'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_id uuid;
  v_status text;
  v_completed_by uuid := null;
  v_completed_at timestamptz := null;
  v_settle_at timestamptz := null;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_kind not in ('backlog', 'log') then
    raise exception 'INVALID_KIND';
  end if;

  if p_points < 1 then
    raise exception 'INVALID_POINTS';
  end if;

  if p_household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  if p_kind = 'log' then
    -- Self-logged work is already done by the creator; open the settle window.
    v_status := 'completed';
    v_completed_by := v_profile_id;
    v_completed_at := now();
    v_settle_at := now() + interval '24 hours';
  else
    v_status := 'open';
  end if;

  insert into public.one_off_tasks (
    household_id, name, description, points, created_by_profile_id, kind, status,
    completed_by_profile_id, completed_at, settle_at
  )
  values (
    p_household_id, p_name, p_description, p_points, v_profile_id, p_kind, v_status,
    v_completed_by, v_completed_at, v_settle_at
  )
  returning id into v_id;

  perform public.emit_household_event(
    p_household_id, v_profile_id,
    case when p_kind = 'log' then 'one_off_logged' else 'one_off_posted' end,
    case when p_kind = 'log' then p_points else null end,
    v_id,
    jsonb_build_object('task_name', p_name)
  );

  return jsonb_build_object('id', v_id, 'status', v_status);
end;
$$;

revoke all on function public.create_one_off_task(uuid, text, integer, text, text) from public;
grant execute on function public.create_one_off_task(uuid, text, integer, text, text) to authenticated;

-- ─── claim_one_off_task RPC ──────────────────────────────────────────────────

create or replace function public.claim_one_off_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_task record;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_task from public.one_off_tasks where id = p_task_id for update;

  if v_task is null then
    raise exception 'TASK_NOT_FOUND';
  end if;

  if v_task.household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  if v_task.status <> 'open' then
    raise exception 'NOT_CLAIMABLE';
  end if;

  update public.one_off_tasks
  set status = 'claimed',
      claimed_by_profile_id = v_profile_id,
      claimed_at = now(),
      updated_at = now()
  where id = p_task_id;

  perform public.emit_household_event(
    v_task.household_id, v_profile_id, 'one_off_claimed',
    null, p_task_id,
    jsonb_build_object('task_name', v_task.name)
  );

  return jsonb_build_object('id', p_task_id, 'status', 'claimed');
end;
$$;

revoke all on function public.claim_one_off_task(uuid) from public;
grant execute on function public.claim_one_off_task(uuid) to authenticated;

-- ─── complete_one_off_task RPC ───────────────────────────────────────────────

create or replace function public.complete_one_off_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_task record;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_task from public.one_off_tasks where id = p_task_id for update;

  if v_task is null then
    raise exception 'TASK_NOT_FOUND';
  end if;

  if v_task.household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  if v_task.status <> 'claimed' then
    raise exception 'NOT_COMPLETABLE';
  end if;

  if v_task.claimed_by_profile_id <> v_profile_id then
    raise exception 'NOT_CLAIMER';
  end if;

  update public.one_off_tasks
  set status = 'completed',
      completed_by_profile_id = v_profile_id,
      completed_at = now(),
      settle_at = now() + interval '24 hours',
      updated_at = now()
  where id = p_task_id;

  perform public.emit_household_event(
    v_task.household_id, v_profile_id, 'one_off_completed',
    v_task.points, p_task_id,
    jsonb_build_object('task_name', v_task.name)
  );

  return jsonb_build_object(
    'points_earned', v_task.points,
    'task_name', v_task.name
  );
end;
$$;

revoke all on function public.complete_one_off_task(uuid) from public;
grant execute on function public.complete_one_off_task(uuid) to authenticated;

-- ─── contest_one_off_task RPC ────────────────────────────────────────────────

create or replace function public.contest_one_off_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_task record;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_task from public.one_off_tasks where id = p_task_id for update;

  if v_task is null then
    raise exception 'TASK_NOT_FOUND';
  end if;

  if v_task.household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  if v_task.status <> 'completed' then
    raise exception 'NOT_CONTESTABLE';
  end if;

  if v_task.settle_at <= now() then
    raise exception 'CONTEST_WINDOW_CLOSED';
  end if;

  if v_task.completed_by_profile_id = v_profile_id then
    raise exception 'CANNOT_CONTEST_OWN';
  end if;

  update public.one_off_tasks
  set status = 'contested',
      contested_by_profile_id = v_profile_id,
      contested_at = now(),
      updated_at = now()
  where id = p_task_id;

  perform public.emit_household_event(
    v_task.household_id, v_profile_id, 'one_off_contested',
    null, p_task_id,
    jsonb_build_object('task_name', v_task.name)
  );

  return jsonb_build_object('id', p_task_id, 'status', 'contested');
end;
$$;

revoke all on function public.contest_one_off_task(uuid) from public;
grant execute on function public.contest_one_off_task(uuid) to authenticated;

-- ─── withdraw_contest_one_off_task RPC ───────────────────────────────────────

create or replace function public.withdraw_contest_one_off_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_task record;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_task from public.one_off_tasks where id = p_task_id for update;

  if v_task is null then
    raise exception 'TASK_NOT_FOUND';
  end if;

  if v_task.household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  if v_task.status <> 'contested' then
    raise exception 'NOT_CONTESTED';
  end if;

  if v_task.contested_by_profile_id <> v_profile_id then
    raise exception 'NOT_CONTESTER';
  end if;

  update public.one_off_tasks
  set status = 'completed',
      contested_by_profile_id = null,
      contested_at = null,
      updated_at = now()
  where id = p_task_id;

  perform public.emit_household_event(
    v_task.household_id, v_profile_id, 'one_off_contest_withdrawn',
    null, p_task_id,
    jsonb_build_object('task_name', v_task.name)
  );

  return jsonb_build_object('id', p_task_id, 'status', 'completed');
end;
$$;

revoke all on function public.withdraw_contest_one_off_task(uuid) from public;
grant execute on function public.withdraw_contest_one_off_task(uuid) to authenticated;

-- ─── settle_due_one_off_tasks RPC (lazy settlement) ──────────────────────────
-- Idempotent sweep called by clients on screen load. Settles uncontested
-- completions past their window (folding points into task_completions) and
-- reverts contested ones (voiding points).

create or replace function public.settle_due_one_off_tasks(p_household_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_row record;
  v_count integer := 0;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_household_id not in (select public.current_household_ids()) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  -- Settle uncontested completions whose window has closed.
  for v_row in
    select * from public.one_off_tasks
    where household_id = p_household_id
      and status = 'completed'
      and settle_at is not null
      and settle_at <= now()
    for update
  loop
    update public.one_off_tasks
    set status = 'settled', updated_at = now()
    where id = v_row.id;

    insert into public.task_completions
      (one_off_task_id, completed_by_profile_id, household_id, points_earned, completed_at)
    values
      (v_row.id, v_row.completed_by_profile_id, v_row.household_id, v_row.points, v_row.completed_at);

    perform public.emit_household_event(
      v_row.household_id, v_row.completed_by_profile_id, 'one_off_settled',
      v_row.points, v_row.id,
      jsonb_build_object('task_name', v_row.name)
    );

    v_count := v_count + 1;
  end loop;

  -- Revert contested completions whose window closed without withdrawal.
  for v_row in
    select * from public.one_off_tasks
    where household_id = p_household_id
      and status = 'contested'
      and settle_at is not null
      and settle_at <= now()
    for update
  loop
    update public.one_off_tasks
    set status = 'reverted', updated_at = now()
    where id = v_row.id;

    perform public.emit_household_event(
      v_row.household_id, v_row.completed_by_profile_id, 'one_off_reverted',
      0, v_row.id,
      jsonb_build_object('task_name', v_row.name)
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.settle_due_one_off_tasks(uuid) from public;
grant execute on function public.settle_due_one_off_tasks(uuid) to authenticated;
