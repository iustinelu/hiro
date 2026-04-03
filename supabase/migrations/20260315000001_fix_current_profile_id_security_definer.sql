-- Fix infinite recursion in RLS policies.
--
-- Chain: current_profile_id() → SELECT profiles (triggers RLS)
--        → profiles_select_household_member → SELECT household_members (triggers RLS)
--        → household_members_select_member → current_profile_id() → ∞
--
-- Fix: SECURITY DEFINER bypasses profiles RLS inside the function.
-- Safe: the only data returned is filtered by auth.uid(), so the caller
-- can never receive another user's profile_id.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;
