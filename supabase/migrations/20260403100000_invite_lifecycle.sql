-- HIR-38: household invite lifecycle (create, accept, expire)

-- ─── Table ──────────────────────────────────────────────────────────────────

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  invited_email text not null,
  invited_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by_profile_id uuid references public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One pending invite per email per household
create unique index idx_invites_unique_pending
  on public.household_invites (household_id, invited_email)
  where status = 'pending';

create index idx_invites_household on public.household_invites(household_id);
create index idx_invites_token on public.household_invites(token);
create index idx_invites_email_status on public.household_invites(invited_email, status);

alter table public.household_invites enable row level security;

-- ─── Helpers ────────────────────────────────────────────────────────────────

-- SECURITY DEFINER helper for current user's email (avoids auth.users access
-- errors in RLS policies when evaluated by anon role).
create or replace function public.current_user_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from auth.users where id = auth.uid() limit 1;
$$;

-- ─── RLS Policies ───────────────────────────────────────────────────────────

-- Household members can see their household's invites
create policy invites_select_household_member
on public.household_invites for select
using (household_id in (select public.current_household_ids()));

-- Authenticated users can also see invites addressed to their email
create policy invites_select_by_email
on public.household_invites for select
using (
  lower(invited_email) = lower(public.current_user_email())
);

-- Household owners can create invites (enforced more strictly in RPC, but
-- this policy allows the SECURITY DEFINER RPC to insert on behalf of owner)
create policy invites_insert_authenticated
on public.household_invites for insert
with check (invited_by_profile_id = public.current_profile_id());

-- Allow status updates via RPC (accept/expire)
create policy invites_update_authenticated
on public.household_invites for update
using (
  household_id in (select public.current_household_ids())
  or lower(invited_email) = lower(public.current_user_email())
);

-- ─── RPCs ───────────────────────────────────────────────────────────────────

-- Create an invite. Only the household owner can invite.
create or replace function public.create_invite(p_household_id uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_token uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Verify caller owns the household
  if not exists (
    select 1 from public.households
    where id = p_household_id and owner_profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_OWNER';
  end if;

  -- Prevent self-invite
  if lower(p_email) = lower(
    (select email from auth.users where id = auth.uid())
  ) then
    raise exception 'CANNOT_INVITE_SELF';
  end if;

  -- Check for existing pending invite
  if exists (
    select 1 from public.household_invites
    where household_id = p_household_id
      and lower(invited_email) = lower(p_email)
      and status = 'pending'
      and expires_at > now()
  ) then
    raise exception 'INVITE_ALREADY_PENDING';
  end if;

  -- Expire any stale pending invites for this email/household
  update public.household_invites
  set status = 'expired', updated_at = now()
  where household_id = p_household_id
    and lower(invited_email) = lower(p_email)
    and status = 'pending'
    and expires_at <= now();

  insert into public.household_invites (household_id, invited_email, invited_by_profile_id)
  values (p_household_id, lower(p_email), v_profile_id)
  returning token into v_token;

  return v_token;
end;
$$;

revoke all on function public.create_invite(uuid, text) from public;
grant execute on function public.create_invite(uuid, text) to authenticated;


-- Accept an invite by token. Caller must be authenticated.
create or replace function public.accept_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_profile_id uuid;
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
    -- Already accepted — return household silently
    return v_invite.household_id;
  end if;

  if v_invite.status = 'expired' or v_invite.expires_at <= now() then
    -- Mark expired if not already
    update public.household_invites
    set status = 'expired', updated_at = now()
    where id = v_invite.id and status = 'pending';
    raise exception 'INVITE_EXPIRED';
  end if;

  -- Check caller is not already a member
  if exists (
    select 1 from public.household_members
    where household_id = v_invite.household_id and profile_id = v_profile_id
  ) then
    -- Already a member — mark invite accepted and return
    update public.household_invites
    set status = 'accepted',
        accepted_by_profile_id = v_profile_id,
        accepted_at = now(),
        updated_at = now()
    where id = v_invite.id;
    return v_invite.household_id;
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

  return v_invite.household_id;
end;
$$;

revoke all on function public.accept_invite(uuid) from public;
grant execute on function public.accept_invite(uuid) to authenticated;


-- Get invite details by token — public-facing, no auth required.
-- Returns minimal info for the acceptance page.
create or replace function public.get_invite_by_token(p_token uuid)
returns table (
  household_name text,
  inviter_name text,
  status text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    h.name as household_name,
    p.display_name as inviter_name,
    i.status,
    i.expires_at
  from public.household_invites i
  join public.households h on h.id = i.household_id
  join public.profiles p on p.id = i.invited_by_profile_id
  where i.token = p_token;
$$;

-- Accessible by anyone (including anon) — it only reveals household name and
-- inviter display name, not emails or IDs.
grant execute on function public.get_invite_by_token(uuid) to anon, authenticated;


-- Bulk-expire stale invites. Call manually or via cron.
create or replace function public.expire_stale_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.household_invites
  set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.expire_stale_invites() from public;
grant execute on function public.expire_stale_invites() to authenticated;
