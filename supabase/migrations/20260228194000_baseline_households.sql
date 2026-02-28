-- HIR-34 baseline schema and RLS

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, profile_id)
);

create index if not exists idx_households_owner_profile_id on public.households(owner_profile_id);
create index if not exists idx_household_members_household_id on public.household_members(household_id);
create index if not exists idx_household_members_profile_id on public.household_members(profile_id);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create policy profiles_select_self
on public.profiles
for select
using (user_id = auth.uid());

create policy profiles_update_self
on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy households_select_member
on public.households
for select
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id = households.id
      and hm.profile_id = public.current_profile_id()
  )
);

create policy households_insert_owner_member
on public.households
for insert
with check (
  owner_profile_id = public.current_profile_id()
);

create policy households_update_owner
on public.households
for update
using (owner_profile_id = public.current_profile_id())
with check (owner_profile_id = public.current_profile_id());

create policy household_members_select_member
on public.household_members
for select
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id = household_members.household_id
      and hm.profile_id = public.current_profile_id()
  )
);

create policy household_members_insert_owner
on public.household_members
for insert
with check (
  exists (
    select 1
    from public.households h
    where h.id = household_members.household_id
      and h.owner_profile_id = public.current_profile_id()
  )
);

create policy household_members_update_owner
on public.household_members
for update
using (
  exists (
    select 1
    from public.households h
    where h.id = household_members.household_id
      and h.owner_profile_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1
    from public.households h
    where h.id = household_members.household_id
      and h.owner_profile_id = public.current_profile_id()
  )
);
