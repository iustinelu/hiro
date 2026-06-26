-- Fix: create_household() overload ambiguity
--
-- Migration 20260315000000 created create_household(p_name text).
-- Migration 20260411000000 added create_household(p_name text, p_currency text default 'EUR')
-- via CREATE OR REPLACE, which does NOT drop an overload with a different signature.
-- Both functions therefore coexisted in the database.
--
-- The mobile client calls create_household with only p_name, so Postgres could not
-- choose between the 1-arg function (exact match) and the 2-arg function (matched via
-- its p_currency default) -> "Could not choose the best candidate function". The web
-- client always passed both args, so it was unaffected.
--
-- Fix: drop the redundant 1-arg overload. The 2-arg version (currency defaults to 'EUR')
-- now satisfies both single- and two-argument calls unambiguously.

drop function if exists public.create_household(text);

-- The 2-arg overload was created without re-establishing the tight grants the 1-arg
-- version had (it leaked EXECUTE to PUBLIC/anon). Restore authenticated-only access.
revoke all on function public.create_household(text, text) from public;
revoke all on function public.create_household(text, text) from anon;
grant execute on function public.create_household(text, text) to authenticated;
