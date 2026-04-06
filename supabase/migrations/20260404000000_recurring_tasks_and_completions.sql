-- HIR-39: recurring tasks + task completions (points ledger)

-- ─── recurring_tasks Table ─────────────────────────────────────────────────

create table public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  description text,
  points integer not null check (points >= 1),
  cadence text not null check (cadence in ('daily', 'weekly', 'custom')),
  cadence_meta jsonb not null default '{}'::jsonb,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recurring_tasks_household on public.recurring_tasks(household_id);

alter table public.recurring_tasks enable row level security;

-- ─── recurring_tasks RLS Policies ──────────────────────────────────────────

create policy recurring_tasks_select
on public.recurring_tasks for select
using (household_id in (select public.current_household_ids()));

create policy recurring_tasks_insert
on public.recurring_tasks for insert
with check (
  household_id in (select public.current_household_ids())
  and created_by_profile_id = public.current_profile_id()
);

create policy recurring_tasks_update
on public.recurring_tasks for update
using (household_id in (select public.current_household_ids()));

create policy recurring_tasks_delete
on public.recurring_tasks for delete
using (household_id in (select public.current_household_ids()));

-- ─── task_completions Table ────────────────────────────────────────────────

create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.recurring_tasks(id) on delete restrict,
  completed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  household_id uuid not null references public.households(id) on delete cascade,
  points_earned integer not null check (points_earned >= 1),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Leaderboard queries: points per household in a date range
create index idx_completions_household_completed
  on public.task_completions(household_id, completed_at);

-- "Done today" checks: has user completed this task today?
create index idx_completions_task_user_completed
  on public.task_completions(task_id, completed_by_profile_id, completed_at);

-- Streak calculation: all completions by a user over time
create index idx_completions_user_completed
  on public.task_completions(completed_by_profile_id, completed_at);

alter table public.task_completions enable row level security;

-- ─── task_completions RLS Policies ─────────────────────────────────────────

-- Any household member can see completions in their household
create policy task_completions_select
on public.task_completions for select
using (household_id in (select public.current_household_ids()));

-- Insert is done via the complete_task RPC (SECURITY DEFINER), but we also
-- allow direct insert for authenticated members as a fallback policy.
create policy task_completions_insert
on public.task_completions for insert
with check (
  household_id in (select public.current_household_ids())
  and completed_by_profile_id = public.current_profile_id()
);

-- No update or delete — immutable ledger

-- ─── complete_task RPC ─────────────────────────────────────────────────────

create or replace function public.complete_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_task record;
  v_points_earned integer;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Fetch the task
  select id, household_id, name, points, is_archived
  into v_task
  from public.recurring_tasks
  where id = p_task_id;

  if v_task is null then
    raise exception 'TASK_NOT_FOUND';
  end if;

  if v_task.is_archived then
    raise exception 'TASK_ARCHIVED';
  end if;

  -- Verify caller is a member of the task's household
  if not exists (
    select 1 from public.household_members
    where household_id = v_task.household_id
      and profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  v_points_earned := v_task.points;

  insert into public.task_completions (task_id, completed_by_profile_id, household_id, points_earned)
  values (p_task_id, v_profile_id, v_task.household_id, v_points_earned);

  return jsonb_build_object(
    'points_earned', v_points_earned,
    'task_name', v_task.name
  );
end;
$$;

revoke all on function public.complete_task(uuid) from public;
grant execute on function public.complete_task(uuid) to authenticated;
