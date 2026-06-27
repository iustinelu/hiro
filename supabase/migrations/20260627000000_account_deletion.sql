-- Store-compliance: in-app account deletion (Apple 5.1.1(v) + Google Play).
-- Adds a self-service account deletion path that erases the authenticated
-- user's personal data, the auth user, and either tears down or transfers
-- ownership of their household(s), with no orphaned households left behind.
--
-- This migration is additive only: two new functions + grants, no schema/table
-- changes. Functions are owned by `postgres`, which has DELETE on auth.users
-- (verified), so the whole flow runs in a single transaction (all-or-nothing).

-- ─── Internal helper: leave a household ──────────────────────────────────────
-- Removes a profile from one household, then keeps the household consistent:
--   * if no members remain  -> delete the household (cascades all its data)
--   * elsif the leaver owned it -> transfer ownership to the oldest remaining
--                                  member (deterministic tiebreak on id)
-- Internal only: invoked by other SECURITY DEFINER functions, never by clients.
--
-- NOTE: this is the same leave/teardown/transfer rule currently inlined in
-- accept_invite_and_leave. That RPC is intentionally left untouched here to
-- avoid coupling two deploys; a follow-up ticket migrates it onto this helper.
create or replace function public.leave_household(
  p_profile_id uuid,
  p_household_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id           uuid;
  v_remaining_count    integer;
  v_new_owner_id       uuid;
begin
  -- Lock the household row so two concurrent leavers/deleters of the same
  -- household serialize here (prevents an orphaned owner_profile_id race).
  select owner_profile_id into v_owner_id
  from public.households
  where id = p_household_id
  for update;

  if v_owner_id is null then
    return; -- household already gone; nothing to do
  end if;

  delete from public.household_members
  where household_id = p_household_id and profile_id = p_profile_id;

  select count(*) into v_remaining_count
  from public.household_members
  where household_id = p_household_id;

  if v_remaining_count = 0 then
    -- No members left — delete the household. Cascades to recurring_tasks,
    -- task_completions, expenses, expense_participants, rewards,
    -- reward_redemptions, household_invites and household_members (all carry
    -- household_id ON DELETE CASCADE); the RESTRICT FKs into profiles never
    -- fire because their referencing rows are deleted in the same cascade.
    delete from public.households where id = p_household_id;
  elsif v_owner_id = p_profile_id then
    -- Leaver owned it — transfer to the oldest remaining member.
    select profile_id into v_new_owner_id
    from public.household_members
    where household_id = p_household_id
    order by created_at asc, id asc
    limit 1;

    update public.households
    set owner_profile_id = v_new_owner_id,
        updated_at = now()
    where id = p_household_id;

    update public.household_members
    set role = 'owner',
        updated_at = now()
    where household_id = p_household_id
      and profile_id = v_new_owner_id;
  end if;
end;
$$;

-- Internal only. Supabase grants EXECUTE on public functions to anon/
-- authenticated by default privileges, so we must revoke from authenticated
-- too — otherwise a client could call leave_household(<anyone>, <any household>)
-- directly and tear down or transfer a household they don't belong to.
revoke all on function public.leave_household(uuid, uuid) from public;
revoke all on function public.leave_household(uuid, uuid) from anon;
revoke all on function public.leave_household(uuid, uuid) from authenticated;

-- ─── RPC: delete the authenticated user's account ────────────────────────────
-- Self-only: takes no arguments and only ever acts on current_profile_id() /
-- auth.uid(), so a caller can never target another user.
--
-- Steps:
--   1. leave every household (teardown if last member, else transfer ownership)
--   2. delete the user's activity_events (metadata jsonb may carry PII)
--   3. expire the pending invites they sent (removes live third-party emails
--      and clears the unique partial pending index) and detach accepted-by refs
--   4. delete the profile if nothing references it; otherwise anonymize it in
--      place as a tombstone so other members' shared ledgers stay intact
--   5. delete the auth user (cascades GoTrue sessions/identities/refresh_tokens)
--
-- GDPR: personal data (display name, auth identity, activity metadata, pending
-- invite emails) is erased. Shared-household ledger content (expense/task/reward
-- titles, completion & redemption history) is co-owned accounting that remaining
-- members legitimately rely on, so it is retained against an anonymized
-- "Deleted user" tombstone rather than destroyed.
--
-- Returns jsonb: { households_left int, profile_anonymized bool }
-- Raises: NOT_AUTHENTICATED
create or replace function public.delete_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid                uuid;
  v_profile_id         uuid;
  v_household_id       uuid;
  v_households_left    integer := 0;
  v_anonymized         boolean := false;
begin
  v_uid := auth.uid();
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- 1. Leave every household (stable FOR snapshot; safe to delete rows within).
  for v_household_id in
    select household_id
    from public.household_members
    where profile_id = v_profile_id
  loop
    perform public.leave_household(v_profile_id, v_household_id);
    v_households_left := v_households_left + 1;
  end loop;

  -- 2. Erase the user's activity log (metadata may contain PII).
  delete from public.activity_events where profile_id = v_profile_id;

  -- 3. Expire pending invites the user sent (removes third-party emails) and
  --    detach any accepted-by references that point at this profile.
  update public.household_invites
  set status = 'expired', updated_at = now()
  where invited_by_profile_id = v_profile_id and status = 'pending';

  update public.household_invites
  set accepted_by_profile_id = null, updated_at = now()
  where accepted_by_profile_id = v_profile_id;

  -- 4. Hard-delete the profile if nothing references it; otherwise anonymize.
  --    Using an exception fallback (rather than a hand-maintained list of every
  --    RESTRICT FK into profiles) is self-maintaining: any future table that
  --    references a profile routes to anonymize instead of crashing in prod.
  begin
    delete from public.profiles where id = v_profile_id;
  exception
    when foreign_key_violation then
      update public.profiles
      set display_name = 'Deleted user',
          theme = null,
          user_id = gen_random_uuid(),
          updated_at = now()
      where id = v_profile_id;
      v_anonymized := true;
  end;

  -- 5. Delete the auth user (last; uses the captured uid local).
  delete from auth.users where id = v_uid;

  return jsonb_build_object(
    'households_left', v_households_left,
    'profile_anonymized', v_anonymized
  );
end;
$$;

revoke all on function public.delete_account() from public;
revoke all on function public.delete_account() from anon;
grant execute on function public.delete_account() to authenticated;
