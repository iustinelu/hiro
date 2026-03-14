-- HIR-35 activity_events table for diagnostics baseline

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  event_name text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_activity_events_profile_id on public.activity_events(profile_id);
create index if not exists idx_activity_events_household_id on public.activity_events(household_id);
create index if not exists idx_activity_events_event_name on public.activity_events(event_name);

alter table public.activity_events enable row level security;

create policy activity_events_insert_own
on public.activity_events
for insert
with check (
  profile_id = public.current_profile_id()
);

create policy activity_events_select_own
on public.activity_events
for select
using (
  profile_id = public.current_profile_id()
);
