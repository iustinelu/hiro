-- HIR-37: household RPC and profile cross-member policy

-- Allow household members to see each other's profiles
create policy profiles_select_household_member
on public.profiles
for select
using (
  exists (
    select 1
    from public.household_members hm1
    join public.household_members hm2
      on hm1.household_id = hm2.household_id
    where hm1.profile_id = public.current_profile_id()
      and hm2.profile_id = profiles.id
  )
);

-- Atomically create a household + owner membership
-- SECURITY DEFINER so both inserts succeed even though household_members_insert_owner
-- requires the household row to already exist with the caller as owner.
create or replace function public.create_household(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_household_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Prevent duplicate households
  if exists (
    select 1
    from public.households
    where owner_profile_id = v_profile_id
  ) then
    raise exception 'HOUSEHOLD_ALREADY_EXISTS';
  end if;

  insert into public.households (name, owner_profile_id)
  values (p_name, v_profile_id)
  returning id into v_household_id;

  insert into public.household_members (household_id, profile_id, role)
  values (v_household_id, v_profile_id, 'owner');

  return v_household_id;
end;
$$;

-- Only authenticated users can call this function
revoke all on function public.create_household(text) from public;
grant execute on function public.create_household(text) to authenticated;
