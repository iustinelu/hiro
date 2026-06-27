-- HIR-71: account-linking UX - precise lookup of which sign-in method(s) an account uses.
--
-- Supabase deliberately hides whether an email exists (anti-enumeration), so the client
-- cannot tell from sign-in/sign-up responses which method a given email is registered with.
-- These SECURITY DEFINER helpers read the auth schema to return that fact, so the UI can guide
-- a user to the correct method instead of hitting a generic "sign-in failed" dead-end.
--
-- Tradeoff: `account_methods_for_email` is granted to `anon`, which is a deliberate (low-risk,
-- friends-and-family) email-existence enumeration surface. It can be rate-limited later if needed.
-- A password is detected via `auth.users.encrypted_password` (NOT via an `email` identity row),
-- because adding a password to an OAuth-only account sets `encrypted_password` without
-- necessarily creating an `email` identity. Google is detected via `auth.identities`.

-- ─── Pre-auth lookup by email (anon-callable) ────────────────────────────────
create or replace function public.account_methods_for_email(p_email text)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user auth.users%rowtype;
  v_methods text[] := '{}';
begin
  select * into v_user
  from auth.users
  where lower(email) = lower(trim(p_email))
  order by created_at
  limit 1;

  if v_user.id is null then
    return '{}';
  end if;

  if v_user.encrypted_password is not null and v_user.encrypted_password <> '' then
    v_methods := array_append(v_methods, 'email');
  end if;

  if exists (
    select 1 from auth.identities
    where user_id = v_user.id and provider = 'google'
  ) then
    v_methods := array_append(v_methods, 'google');
  end if;

  return v_methods;
end;
$$;

-- ─── Logged-in user's own methods (authenticated only) ───────────────────────
-- Gates the "Set a password" affordance precisely (only shown when no password yet).
create or replace function public.current_account_methods()
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user auth.users%rowtype;
  v_methods text[] := '{}';
begin
  select * into v_user from auth.users where id = auth.uid();

  if v_user.id is null then
    return '{}';
  end if;

  if v_user.encrypted_password is not null and v_user.encrypted_password <> '' then
    v_methods := array_append(v_methods, 'email');
  end if;

  if exists (
    select 1 from auth.identities
    where user_id = v_user.id and provider = 'google'
  ) then
    v_methods := array_append(v_methods, 'google');
  end if;

  return v_methods;
end;
$$;

-- ─── Grants ──────────────────────────────────────────────────────────────────
revoke all on function public.account_methods_for_email(text) from public;
grant execute on function public.account_methods_for_email(text) to anon, authenticated;

-- Supabase grants EXECUTE on public functions to anon+authenticated by default, so we
-- must explicitly revoke from anon (revoking from PUBLIC alone leaves the default grant).
revoke all on function public.current_account_methods() from public, anon;
grant execute on function public.current_account_methods() to authenticated;
