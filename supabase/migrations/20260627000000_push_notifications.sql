-- HIR-66: push notifications — device token registry + delivery outbox
--
-- Mobile registers an Expo push token per install; household events enqueue
-- notification rows that an edge function (send-push) drains and delivers via
-- Expo's push API. Token writes go through SECURITY DEFINER RPCs so that a token
-- moving to a new user (same install, different login) is reassigned cleanly —
-- an own-row UPDATE policy would block that reassignment.

-- ─── device_tokens Table ─────────────────────────────────────────────────────

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_device_tokens_profile on public.device_tokens(profile_id);

alter table public.device_tokens enable row level security;

-- ─── device_tokens RLS Policies ──────────────────────────────────────────────

-- A user can read only their own device rows. Writes go through the
-- register_device_token / unregister_device_token RPCs (no direct write policy).
create policy device_tokens_select_own
on public.device_tokens for select
using (profile_id = public.current_profile_id());

-- ─── notification_outbox Table ───────────────────────────────────────────────

-- Transactional outbox: triggers enqueue here in the same transaction as the
-- domain event. RLS is enabled with NO policies — clients are default-denied;
-- the SECURITY DEFINER triggers (write) and the edge function service role
-- (read/update) bypass RLS.

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  event_type text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

-- Drain query: pending rows, oldest first. Partial index keeps it tight.
create index idx_notification_outbox_pending
  on public.notification_outbox(created_at)
  where status = 'pending';

alter table public.notification_outbox enable row level security;

-- No policies: clients are default-denied. Triggers + service role bypass RLS.

-- ─── register_device_token RPC ───────────────────────────────────────────────

create or replace function public.register_device_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_platform not in ('ios', 'android') then
    raise exception 'INVALID_PLATFORM';
  end if;

  -- Upsert by token: the same install keeps one row; if the install's token
  -- moves to a new user, on-conflict reassigns it to the current profile.
  insert into public.device_tokens (profile_id, token, platform)
  values (v_profile_id, p_token, p_platform)
  on conflict (token) do update
    set profile_id = v_profile_id,
        platform = excluded.platform,
        updated_at = now();
end;
$$;

revoke all on function public.register_device_token(text, text) from public;
grant execute on function public.register_device_token(text, text) to authenticated;

-- ─── unregister_device_token RPC ─────────────────────────────────────────────

create or replace function public.unregister_device_token(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  delete from public.device_tokens
  where token = p_token
    and profile_id = v_profile_id;
end;
$$;

revoke all on function public.unregister_device_token(text) from public;
grant execute on function public.unregister_device_token(text) to authenticated;

-- ─── enqueue_task_completion_notifications trigger ───────────────────────────

-- When a member completes a chore, nudge every OTHER member of the household.
create or replace function public.enqueue_task_completion_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
  v_task_name text;
begin
  select coalesce(display_name, 'Someone') into v_actor_name
  from public.profiles where id = new.completed_by_profile_id;

  select name into v_task_name
  from public.recurring_tasks where id = new.task_id;

  insert into public.notification_outbox (recipient_profile_id, title, body, data, event_type)
  select
    hm.profile_id,
    'Chore done',
    v_actor_name || ' completed ' || coalesce(v_task_name, 'a chore'),
    jsonb_build_object(
      'event_type', 'task_completed',
      'household_id', new.household_id,
      'actor_profile_id', new.completed_by_profile_id,
      'task_id', new.task_id
    ),
    'task_completed'
  from public.household_members hm
  where hm.household_id = new.household_id
    and hm.profile_id <> new.completed_by_profile_id;

  return new;
end;
$$;

create trigger trg_task_completion_notifications
after insert on public.task_completions
for each row execute function public.enqueue_task_completion_notifications();

-- ─── enqueue_reward_redemption_notifications trigger ─────────────────────────

-- When a member redeems a reward, let every OTHER member know.
create or replace function public.enqueue_reward_redemption_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
  v_reward_title text;
begin
  select coalesce(display_name, 'Someone') into v_actor_name
  from public.profiles where id = new.redeemed_by_profile_id;

  select title into v_reward_title
  from public.rewards where id = new.reward_id;

  insert into public.notification_outbox (recipient_profile_id, title, body, data, event_type)
  select
    hm.profile_id,
    'Reward redeemed',
    v_actor_name || ' redeemed ' || coalesce(v_reward_title, 'a reward'),
    jsonb_build_object(
      'event_type', 'reward_redeemed',
      'household_id', new.household_id,
      'actor_profile_id', new.redeemed_by_profile_id,
      'reward_id', new.reward_id
    ),
    'reward_redeemed'
  from public.household_members hm
  where hm.household_id = new.household_id
    and hm.profile_id <> new.redeemed_by_profile_id;

  return new;
end;
$$;

create trigger trg_reward_redemption_notifications
after insert on public.reward_redemptions
for each row execute function public.enqueue_reward_redemption_notifications();
