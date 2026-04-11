-- HIR-48+49: rewards marketplace + redemption ledger

-- ─── rewards Table ──────────────────────────────────────────────────────────

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  point_cost integer not null check (point_cost >= 1),
  is_archived boolean not null default false,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_rewards_household on public.rewards(household_id);

alter table public.rewards enable row level security;

-- ─── rewards RLS Policies ────────────────────────────────────────────────────

create policy rewards_select
on public.rewards for select
using (household_id in (select public.current_household_ids()));

create policy rewards_insert
on public.rewards for insert
with check (
  household_id in (select public.current_household_ids())
  and created_by_profile_id = public.current_profile_id()
);

create policy rewards_update
on public.rewards for update
using (household_id in (select public.current_household_ids()));

create policy rewards_delete
on public.rewards for delete
using (household_id in (select public.current_household_ids()));

-- ─── reward_redemptions Table ────────────────────────────────────────────────

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete restrict,
  redeemed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  household_id uuid not null references public.households(id) on delete cascade,
  points_spent integer not null check (points_spent >= 1),
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- History queries: redemptions per household in date range
create index idx_redemptions_household_redeemed
  on public.reward_redemptions(household_id, redeemed_at);

-- Balance queries: total spent by a user
create index idx_redemptions_profile
  on public.reward_redemptions(redeemed_by_profile_id);

alter table public.reward_redemptions enable row level security;

-- ─── reward_redemptions RLS Policies ────────────────────────────────────────

-- Household members can see all redemptions in their household
create policy reward_redemptions_select
on public.reward_redemptions for select
using (household_id in (select public.current_household_ids()));

-- Insert is done via redeem_reward RPC (SECURITY DEFINER) only
-- No direct insert policy — RPC handles authorization

-- No UPDATE or DELETE — immutable ledger

-- ─── redeem_reward RPC ──────────────────────────────────────────────────────

create or replace function public.redeem_reward(p_reward_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_reward record;
  v_points_earned bigint;
  v_points_spent bigint;
  v_balance bigint;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Fetch the reward
  select id, household_id, title, point_cost, is_archived
  into v_reward
  from public.rewards
  where id = p_reward_id;

  if v_reward is null then
    raise exception 'REWARD_NOT_FOUND';
  end if;

  if v_reward.is_archived then
    raise exception 'REWARD_ARCHIVED';
  end if;

  -- Verify caller is a member of the reward's household
  if not exists (
    select 1 from public.household_members
    where household_id = v_reward.household_id
      and profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  -- Calculate current balance
  select coalesce(sum(points_earned), 0)
  into v_points_earned
  from public.task_completions
  where completed_by_profile_id = v_profile_id
    and household_id = v_reward.household_id;

  select coalesce(sum(points_spent), 0)
  into v_points_spent
  from public.reward_redemptions
  where redeemed_by_profile_id = v_profile_id
    and household_id = v_reward.household_id;

  v_balance := v_points_earned - v_points_spent;

  if v_balance < v_reward.point_cost then
    raise exception 'INSUFFICIENT_POINTS';
  end if;

  insert into public.reward_redemptions (
    reward_id, redeemed_by_profile_id, household_id, points_spent
  )
  values (p_reward_id, v_profile_id, v_reward.household_id, v_reward.point_cost);

  return jsonb_build_object(
    'points_spent', v_reward.point_cost,
    'reward_title', v_reward.title,
    'remaining_balance', v_balance - v_reward.point_cost
  );
end;
$$;

revoke all on function public.redeem_reward(uuid) from public;
grant execute on function public.redeem_reward(uuid) to authenticated;
