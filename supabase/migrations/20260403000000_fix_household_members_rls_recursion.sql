-- Fix infinite recursion in household_members SELECT policy.
--
-- Problem: household_members_select_member references household_members in its
-- own USING clause, causing PostgreSQL error 42P17 "infinite recursion detected
-- in policy for relation household_members".  The same recursion cascades to
-- households_select_member and profiles_select_household_member because they
-- also sub-select from household_members.
--
-- Fix: introduce a SECURITY DEFINER helper that returns the caller's household
-- IDs without triggering RLS, then rewrite all three policies to use it.

-- 1. Helper function: returns household IDs for the current user, bypassing RLS.
create or replace function public.current_household_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select hm.household_id
  from public.household_members hm
  where hm.profile_id = public.current_profile_id();
$$;

-- 2. Rewrite household_members SELECT policy (was self-referential).
drop policy household_members_select_member on public.household_members;
create policy household_members_select_member
on public.household_members
for select
using (
  household_id in (select public.current_household_ids())
);

-- 3. Rewrite households SELECT policy (was sub-selecting household_members).
drop policy households_select_member on public.households;
create policy households_select_member
on public.households
for select
using (
  id in (select public.current_household_ids())
);

-- 4. Rewrite profiles SELECT policy for household co-members.
--    Old version joined household_members twice → triggered the broken policy.
drop policy profiles_select_household_member on public.profiles;
create policy profiles_select_household_member
on public.profiles
for select
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id in (select public.current_household_ids())
      and hm.profile_id = profiles.id
  )
);
