-- UX: collect display name at signup + household currency setting

-- ─── Update profile bootstrap trigger ─────────────────────────────────────
-- Pull display_name from Supabase auth user metadata (raw_user_meta_data)
-- so the name is set atomically during sign-up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (user_id) do update
    set display_name = coalesce(excluded.display_name, profiles.display_name);
  return new;
end;
$$;

-- ─── Add currency to households ───────────────────────────────────────────

alter table public.households
  add column currency text not null default 'EUR'
  check (currency in ('EUR', 'GBP', 'RON', 'USD'));

-- ─── Update create_household RPC to accept currency ──────────────────────

create or replace function public.create_household(p_name text, p_currency text default 'EUR')
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

  if exists (
    select 1
    from public.households
    where owner_profile_id = v_profile_id
  ) then
    raise exception 'HOUSEHOLD_ALREADY_EXISTS';
  end if;

  insert into public.households (name, owner_profile_id, currency)
  values (p_name, v_profile_id, p_currency)
  returning id into v_household_id;

  insert into public.household_members (household_id, profile_id, role)
  values (v_household_id, v_profile_id, 'owner');

  return v_household_id;
end;
$$;
