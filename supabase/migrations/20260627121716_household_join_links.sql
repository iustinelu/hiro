-- HIR-73: open household join links (reusable, revocable, shareable)
--
-- A household can have at most one ACTIVE join link. The link's `code` is the
-- shareable secret embedded in https://<host>/join/<code> universal links and
-- pasted into the in-app "Join a household" form. Owners can disable (revoke)
-- or rotate the link. Joining is unified through join_by_code, which also falls
-- back to legacy single-use household_invites tokens so old links keep working.

-- ─── Table ──────────────────────────────────────────────────────────────────

create table public.household_join_links (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  code uuid not null unique default gen_random_uuid(),
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one active link per household
create unique index idx_join_links_unique_active
  on public.household_join_links (household_id)
  where is_active;

create index idx_join_links_household on public.household_join_links(household_id);
create index idx_join_links_code on public.household_join_links(code);

alter table public.household_join_links enable row level security;

-- ─── RLS ──────────────────────────────────────────────────────────────────
-- Members can read their household's link(s). All writes flow through the
-- SECURITY DEFINER RPCs below (no insert/update/delete policy => direct DML
-- from anon/authenticated is denied by default).

create policy join_links_select_household_member
on public.household_join_links for select
using (household_id in (select public.current_household_ids()));

-- ─── Internal helper: leave current household (delete-if-empty / transfer) ───
-- Mirrors the leave logic in accept_invite_and_leave. Internal only.
create or replace function public.leave_current_household_for_switch(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_household_id      uuid;
  v_old_household_name    text;
  v_old_owner_id          uuid;
  v_old_household_deleted boolean := false;
  v_remaining_count       integer;
  v_new_owner_profile_id  uuid;
begin
  select hm.household_id, h.name, h.owner_profile_id
  into v_old_household_id, v_old_household_name, v_old_owner_id
  from public.household_members hm
  join public.households h on h.id = hm.household_id
  where hm.profile_id = p_profile_id
  limit 1;

  if v_old_household_id is null then
    return jsonb_build_object('old_household_deleted', false, 'old_household_name', null);
  end if;

  delete from public.household_members
  where household_id = v_old_household_id and profile_id = p_profile_id;

  select count(*) into v_remaining_count
  from public.household_members
  where household_id = v_old_household_id;

  if v_remaining_count = 0 then
    delete from public.households where id = v_old_household_id;
    v_old_household_deleted := true;
  elsif v_old_owner_id = p_profile_id then
    select profile_id into v_new_owner_profile_id
    from public.household_members
    where household_id = v_old_household_id
    order by created_at asc
    limit 1;

    update public.households
    set owner_profile_id = v_new_owner_profile_id, updated_at = now()
    where id = v_old_household_id;

    update public.household_members
    set role = 'owner', updated_at = now()
    where household_id = v_old_household_id and profile_id = v_new_owner_profile_id;
  end if;

  return jsonb_build_object(
    'old_household_deleted', v_old_household_deleted,
    'old_household_name', v_old_household_name
  );
end;
$$;

-- Internal only: takes a caller-supplied profile id and runs as definer, so it
-- must NOT be callable directly by clients. Supabase default privileges grant
-- execute to anon/authenticated, so revoke from them explicitly. Internal calls
-- from the SECURITY DEFINER RPCs below run as the function owner and still work.
revoke all on function public.leave_current_household_for_switch(uuid) from public, anon, authenticated;

-- ─── RPCs ───────────────────────────────────────────────────────────────────

-- Return the household's active join link code, creating one if none exists.
-- Owner only.
create or replace function public.get_or_create_join_link(p_household_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_code uuid;
begin
  v_profile_id := public.current_profile_id();
  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if not exists (
    select 1 from public.households
    where id = p_household_id and owner_profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_OWNER';
  end if;

  select code into v_code
  from public.household_join_links
  where household_id = p_household_id and is_active
  limit 1;

  if v_code is not null then
    return v_code;
  end if;

  insert into public.household_join_links (household_id, created_by_profile_id)
  values (p_household_id, v_profile_id)
  returning code into v_code;

  return v_code;
end;
$$;

revoke all on function public.get_or_create_join_link(uuid) from public;
grant execute on function public.get_or_create_join_link(uuid) to authenticated;


-- Enable/disable (revoke) the household's join link. Owner only.
-- Disabling deactivates the active link. Enabling ensures an active link exists.
create or replace function public.set_join_link_active(p_household_id uuid, p_active boolean)
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

  if not exists (
    select 1 from public.households
    where id = p_household_id and owner_profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_OWNER';
  end if;

  if p_active then
    if not exists (
      select 1 from public.household_join_links
      where household_id = p_household_id and is_active
    ) then
      insert into public.household_join_links (household_id, created_by_profile_id)
      values (p_household_id, v_profile_id);
    end if;
  else
    update public.household_join_links
    set is_active = false, updated_at = now()
    where household_id = p_household_id and is_active;
  end if;
end;
$$;

revoke all on function public.set_join_link_active(uuid, boolean) from public;
grant execute on function public.set_join_link_active(uuid, boolean) to authenticated;


-- Rotate the join link: deactivate the current active link and mint a new one.
-- Owner only. Returns the new code.
create or replace function public.rotate_join_link(p_household_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_code uuid;
begin
  v_profile_id := public.current_profile_id();
  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if not exists (
    select 1 from public.households
    where id = p_household_id and owner_profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_OWNER';
  end if;

  update public.household_join_links
  set is_active = false, updated_at = now()
  where household_id = p_household_id and is_active;

  insert into public.household_join_links (household_id, created_by_profile_id)
  values (p_household_id, v_profile_id)
  returning code into v_code;

  return v_code;
end;
$$;

revoke all on function public.rotate_join_link(uuid) from public;
grant execute on function public.rotate_join_link(uuid) to authenticated;


-- Public-facing preview for a code (open link OR legacy invite token).
-- Reveals only household name + member count + validity. Safe for anon.
create or replace function public.get_household_by_code(p_code uuid)
returns table (
  household_name text,
  member_count integer,
  is_valid boolean
)
language sql
stable
security definer
set search_path = public
as $$
  -- Open join link
  select
    h.name,
    (select count(*)::integer from public.household_members m where m.household_id = h.id),
    (l.is_active and (l.expires_at is null or l.expires_at > now()))
  from public.household_join_links l
  join public.households h on h.id = l.household_id
  where l.code = p_code
  union all
  -- Legacy single-use invite token (only when no open link matched)
  select
    h.name,
    (select count(*)::integer from public.household_members m where m.household_id = h.id),
    (i.status = 'pending' and i.expires_at > now())
  from public.household_invites i
  join public.households h on h.id = i.household_id
  where i.token = p_code
    and not exists (select 1 from public.household_join_links l2 where l2.code = p_code)
  limit 1;
$$;

grant execute on function public.get_household_by_code(uuid) to anon, authenticated;


-- Join a household by code. Unified entry: resolves an active, non-expired open
-- link first, else falls back to a legacy single-use invite token.
-- Returns the joined household_id.
-- Raises: NOT_AUTHENTICATED, JOIN_LINK_DISABLED, JOIN_LINK_EXPIRED,
--   ALREADY_A_MEMBER, ALREADY_IN_HOUSEHOLD, INVITE_NOT_FOUND (legacy path).
create or replace function public.join_by_code(p_code uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_link record;
  v_existing_household_id uuid;
begin
  v_profile_id := public.current_profile_id();
  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_link
  from public.household_join_links
  where code = p_code;

  -- No open link: delegate to legacy single-use invite flow.
  if v_link is null then
    return public.accept_invite(p_code);
  end if;

  if not v_link.is_active then
    raise exception 'JOIN_LINK_DISABLED';
  end if;

  if v_link.expires_at is not null and v_link.expires_at <= now() then
    raise exception 'JOIN_LINK_EXPIRED';
  end if;

  if exists (
    select 1 from public.household_members
    where household_id = v_link.household_id and profile_id = v_profile_id
  ) then
    raise exception 'ALREADY_A_MEMBER';
  end if;

  select household_id into v_existing_household_id
  from public.household_members
  where profile_id = v_profile_id
  limit 1;

  if v_existing_household_id is not null then
    raise exception 'ALREADY_IN_HOUSEHOLD';
  end if;

  insert into public.household_members (household_id, profile_id, role)
  values (v_link.household_id, v_profile_id, 'member');

  return v_link.household_id;
end;
$$;

revoke all on function public.join_by_code(uuid) from public;
grant execute on function public.join_by_code(uuid) to authenticated;


-- Join by code, leaving (and deleting/transferring) the caller's current
-- household first. Unified: open link, else legacy invite token.
-- Returns jsonb { household_id, old_household_deleted, old_household_name }.
create or replace function public.join_by_code_and_leave(p_code uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_link record;
  v_leave jsonb;
begin
  v_profile_id := public.current_profile_id();
  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_link
  from public.household_join_links
  where code = p_code;

  -- No open link: delegate to legacy invite-and-leave flow.
  if v_link is null then
    return public.accept_invite_and_leave(p_code);
  end if;

  if not v_link.is_active then
    raise exception 'JOIN_LINK_DISABLED';
  end if;

  if v_link.expires_at is not null and v_link.expires_at <= now() then
    raise exception 'JOIN_LINK_EXPIRED';
  end if;

  if exists (
    select 1 from public.household_members
    where household_id = v_link.household_id and profile_id = v_profile_id
  ) then
    raise exception 'ALREADY_A_MEMBER';
  end if;

  v_leave := public.leave_current_household_for_switch(v_profile_id);

  insert into public.household_members (household_id, profile_id, role)
  values (v_link.household_id, v_profile_id, 'member');

  return jsonb_build_object(
    'household_id', v_link.household_id,
    'old_household_deleted', (v_leave->>'old_household_deleted')::boolean,
    'old_household_name', v_leave->>'old_household_name'
  );
end;
$$;

revoke all on function public.join_by_code_and_leave(uuid) from public;
grant execute on function public.join_by_code_and_leave(uuid) to authenticated;
