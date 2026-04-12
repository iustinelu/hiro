-- HIR-64: accept invite even when already in another household
-- Leaves the current household (deleting it if empty), then joins the new one.

-- ─── RPC ────────────────────────────────────────────────────────────────────

-- Accept an invite, automatically leaving (and optionally deleting) the
-- caller's current household first.
--
-- Returns jsonb:
--   household_id        uuid    — the newly joined household
--   old_household_deleted bool  — true if the old household was deleted
--   old_household_name  text    — name of the old household (null if none)
--
-- Raises (same codes as accept_invite for shared failure modes):
--   NOT_AUTHENTICATED
--   INVITE_NOT_FOUND
--   INVITE_ALREADY_ACCEPTED
--   INVITE_EXPIRED
--   ALREADY_A_MEMBER        — caller is already in the invite's target household
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

  return jsonb_build_object(
    'household_id',        v_invite.household_id,
    'old_household_deleted', v_old_household_deleted,
    'old_household_name',  v_old_household_name
  );
end;
$$;

revoke all on function public.accept_invite_and_leave(uuid) from public;
grant execute on function public.accept_invite_and_leave(uuid) to authenticated;
