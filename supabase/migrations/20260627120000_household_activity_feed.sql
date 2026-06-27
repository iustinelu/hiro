-- HIR-70: household activity feed (the fairness/transparency timeline)
--
-- This is the household-VISIBLE shared timeline. It is deliberately NOT
-- activity_events (own-rows-only private diagnostics) — widening that table's
-- RLS would leak every user's private tab_viewed events to the whole household.
--
-- Feed rows are written EXCLUSIVELY by SECURITY DEFINER functions (which bypass
-- RLS). There is no client insert/update/delete policy, so the timeline cannot
-- be forged or tampered with from the client.

-- ─── household_activity Table ────────────────────────────────────────────────

create table public.household_activity (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  actor_profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in (
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
    'member_left'
  )),
  points_delta integer,
  ref_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Feed queries: newest-first per household
create index idx_household_activity_household_created
  on public.household_activity(household_id, created_at desc);

alter table public.household_activity enable row level security;

-- ─── household_activity RLS Policies ─────────────────────────────────────────

-- Any household member can read their household's timeline.
create policy household_activity_select
on public.household_activity for select
using (household_id in (select public.current_household_ids()));

-- No insert/update/delete policies: rows are written only by the SECURITY
-- DEFINER emitter below (and the RPCs that call it), never directly by clients.

-- ─── emit_household_event helper ─────────────────────────────────────────────

create or replace function public.emit_household_event(
  p_household_id uuid,
  p_actor_profile_id uuid,
  p_kind text,
  p_points_delta integer default null,
  p_ref_id uuid default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_activity (
    household_id, actor_profile_id, kind, points_delta, ref_id, metadata
  )
  values (
    p_household_id, p_actor_profile_id, p_kind, p_points_delta, p_ref_id, p_metadata
  );
end;
$$;

-- Callable only from within other SECURITY DEFINER functions; deny direct use.
-- NB: Supabase default privileges auto-grant EXECUTE on new public functions to
-- anon/authenticated, so revoking from PUBLIC is not enough — revoke the role
-- grants explicitly. Internal definer callers (complete_task, the one-off RPCs,
-- etc.) run as the function owner and are unaffected.
revoke all on function public.emit_household_event(uuid, uuid, text, integer, uuid, jsonb) from public;
revoke execute on function public.emit_household_event(uuid, uuid, text, integer, uuid, jsonb) from anon, authenticated;

-- ─── Rewire existing RPCs to emit feed events (same signatures) ───────────────

-- complete_task: emit 'task_completed' after the ledger insert.
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

  perform public.emit_household_event(
    v_task.household_id, v_profile_id, 'task_completed',
    v_points_earned, p_task_id,
    jsonb_build_object('task_name', v_task.name)
  );

  return jsonb_build_object(
    'points_earned', v_points_earned,
    'task_name', v_task.name
  );
end;
$$;

revoke all on function public.complete_task(uuid) from public;
grant execute on function public.complete_task(uuid) to authenticated;

-- redeem_reward: emit 'reward_redeemed' (negative points_delta) after the insert.
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

  perform public.emit_household_event(
    v_reward.household_id, v_profile_id, 'reward_redeemed',
    -v_reward.point_cost, p_reward_id,
    jsonb_build_object('reward_title', v_reward.title)
  );

  return jsonb_build_object(
    'points_spent', v_reward.point_cost,
    'reward_title', v_reward.title,
    'remaining_balance', v_balance - v_reward.point_cost
  );
end;
$$;

revoke all on function public.redeem_reward(uuid) from public;
grant execute on function public.redeem_reward(uuid) to authenticated;

-- accept_invite: emit 'member_joined' after the membership insert.
create or replace function public.accept_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_profile_id uuid;
  v_existing_household_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_invite
  from public.household_invites
  where token = p_token;

  if v_invite is null then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  if v_invite.status = 'accepted' then
    raise exception 'INVITE_ALREADY_ACCEPTED';
  end if;

  if v_invite.status = 'expired' or v_invite.expires_at <= now() then
    update public.household_invites
    set status = 'expired', updated_at = now()
    where id = v_invite.id and status = 'pending';
    raise exception 'INVITE_EXPIRED';
  end if;

  -- Check caller is already a member of THIS household
  if exists (
    select 1 from public.household_members
    where household_id = v_invite.household_id and profile_id = v_profile_id
  ) then
    update public.household_invites
    set status = 'accepted',
        accepted_by_profile_id = v_profile_id,
        accepted_at = now(),
        updated_at = now()
    where id = v_invite.id;
    raise exception 'ALREADY_A_MEMBER';
  end if;

  -- Check caller is already in a DIFFERENT household (MVP: single household)
  select household_id into v_existing_household_id
  from public.household_members
  where profile_id = v_profile_id
  limit 1;

  if v_existing_household_id is not null then
    raise exception 'ALREADY_IN_HOUSEHOLD';
  end if;

  -- Accept: update invite + add member
  update public.household_invites
  set status = 'accepted',
      accepted_by_profile_id = v_profile_id,
      accepted_at = now(),
      updated_at = now()
  where id = v_invite.id;

  insert into public.household_members (household_id, profile_id, role)
  values (v_invite.household_id, v_profile_id, 'member');

  perform public.emit_household_event(
    v_invite.household_id, v_profile_id, 'member_joined',
    null, null, null
  );

  return v_invite.household_id;
end;
$$;

revoke all on function public.accept_invite(uuid) from public;
grant execute on function public.accept_invite(uuid) to authenticated;

-- accept_invite_and_leave: emit 'member_left' on the old household (when it
-- survives) and 'member_joined' on the new one.
create or replace function public.accept_invite_and_leave(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id             uuid;
  v_invite                 record;
  v_old_household_id       uuid;
  v_old_household_name     text;
  v_old_owner_id           uuid;
  v_old_household_deleted  boolean := false;
  v_remaining_count        integer;
  v_new_owner_profile_id   uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Load and validate the invite
  select * into v_invite
  from public.household_invites
  where token = p_token;

  if v_invite is null then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  if v_invite.status = 'accepted' then
    raise exception 'INVITE_ALREADY_ACCEPTED';
  end if;

  if v_invite.status = 'expired' or v_invite.expires_at <= now() then
    update public.household_invites
    set status = 'expired', updated_at = now()
    where id = v_invite.id and status = 'pending';
    raise exception 'INVITE_EXPIRED';
  end if;

  -- Already in the target household — idempotent: mark accepted, then error
  if exists (
    select 1 from public.household_members
    where household_id = v_invite.household_id and profile_id = v_profile_id
  ) then
    update public.household_invites
    set status = 'accepted',
        accepted_by_profile_id = v_profile_id,
        accepted_at = now(),
        updated_at = now()
    where id = v_invite.id;
    raise exception 'ALREADY_A_MEMBER';
  end if;

  -- ── Leave current household (if any) ─────────────────────────────────────

  select hm.household_id, h.name, h.owner_profile_id
  into v_old_household_id, v_old_household_name, v_old_owner_id
  from public.household_members hm
  join public.households h on h.id = hm.household_id
  where hm.profile_id = v_profile_id
  limit 1;

  if v_old_household_id is not null then
    -- Remove caller from old household
    delete from public.household_members
    where household_id = v_old_household_id and profile_id = v_profile_id;

    -- Count remaining members
    select count(*) into v_remaining_count
    from public.household_members
    where household_id = v_old_household_id;

    if v_remaining_count = 0 then
      -- No members left — delete the household (cascades to invites, etc.)
      delete from public.households where id = v_old_household_id;
      v_old_household_deleted := true;
    elsif v_old_owner_id = v_profile_id then
      -- Caller was the owner; transfer ownership to oldest remaining member
      select profile_id into v_new_owner_profile_id
      from public.household_members
      where household_id = v_old_household_id
      order by created_at asc
      limit 1;

      update public.households
      set owner_profile_id = v_new_owner_profile_id,
          updated_at = now()
      where id = v_old_household_id;

      update public.household_members
      set role = 'owner',
          updated_at = now()
      where household_id = v_old_household_id
        and profile_id = v_new_owner_profile_id;
    end if;

    -- Record the departure on the old timeline (skip if the household was
    -- deleted — its feed rows cascade away and nobody remains to read them).
    if not v_old_household_deleted then
      perform public.emit_household_event(
        v_old_household_id, v_profile_id, 'member_left',
        null, null,
        jsonb_build_object('household_name', v_old_household_name)
      );
    end if;
  end if;

  -- ── Join new household ────────────────────────────────────────────────────

  update public.household_invites
  set status = 'accepted',
      accepted_by_profile_id = v_profile_id,
      accepted_at = now(),
      updated_at = now()
  where id = v_invite.id;

  insert into public.household_members (household_id, profile_id, role)
  values (v_invite.household_id, v_profile_id, 'member');

  perform public.emit_household_event(
    v_invite.household_id, v_profile_id, 'member_joined',
    null, null, null
  );

  return jsonb_build_object(
    'household_id',        v_invite.household_id,
    'old_household_deleted', v_old_household_deleted,
    'old_household_name',  v_old_household_name
  );
end;
$$;

revoke all on function public.accept_invite_and_leave(uuid) from public;
grant execute on function public.accept_invite_and_leave(uuid) to authenticated;
