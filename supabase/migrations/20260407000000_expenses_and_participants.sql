-- HIR-44: expenses and participant splits for household budget tracking

-- ─── expenses Table ───────────────────────────────────────────────────────

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null check (amount > 0),
  date date not null,
  payer_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_expenses_household_date on public.expenses(household_id, date desc);

alter table public.expenses enable row level security;

-- ─── expenses RLS Policies ────────────────────────────────────────────────

create policy expenses_select
on public.expenses for select
using (household_id in (select public.current_household_ids()));

create policy expenses_insert
on public.expenses for insert
with check (household_id in (select public.current_household_ids()));

create policy expenses_update
on public.expenses for update
using (household_id in (select public.current_household_ids()));

create policy expenses_delete
on public.expenses for delete
using (household_id in (select public.current_household_ids()));

-- ─── expense_participants Table ───────────────────────────────────────────

create table public.expense_participants (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  share numeric(10,2) not null check (share > 0),
  created_at timestamptz not null default now()
);

create index idx_expense_participants_expense on public.expense_participants(expense_id);

alter table public.expense_participants enable row level security;

-- ─── expense_participants RLS Policies ────────────────────────────────────

create policy expense_participants_select
on public.expense_participants for select
using (
  exists (
    select 1 from public.expenses e
    where e.id = expense_participants.expense_id
      and e.household_id in (select public.current_household_ids())
  )
);

create policy expense_participants_insert
on public.expense_participants for insert
with check (
  exists (
    select 1 from public.expenses e
    where e.id = expense_participants.expense_id
      and e.household_id in (select public.current_household_ids())
  )
);

-- ─── create_expense RPC ───────────────────────────────────────────────────

create or replace function public.create_expense(
  p_household_id uuid,
  p_title text,
  p_amount numeric,
  p_date date,
  p_payer_profile_id uuid,
  p_participant_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_expense_id uuid;
  v_count integer;
  v_base_share numeric(10,2);
  v_remainder numeric(10,2);
  v_i integer;
  v_pid uuid;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Verify caller is a household member
  if not exists (
    select 1 from public.household_members
    where household_id = p_household_id and profile_id = v_profile_id
  ) then
    raise exception 'NOT_HOUSEHOLD_MEMBER';
  end if;

  -- Verify payer is a household member
  if not exists (
    select 1 from public.household_members
    where household_id = p_household_id and profile_id = p_payer_profile_id
  ) then
    raise exception 'PAYER_NOT_HOUSEHOLD_MEMBER';
  end if;

  -- Verify all participants are household members
  if exists (
    select 1 from unnest(p_participant_ids) as pid
    where not exists (
      select 1 from public.household_members
      where household_id = p_household_id and profile_id = pid
    )
  ) then
    raise exception 'PARTICIPANT_NOT_HOUSEHOLD_MEMBER';
  end if;

  v_count := array_length(p_participant_ids, 1);
  if v_count is null or v_count = 0 then
    raise exception 'NO_PARTICIPANTS';
  end if;

  -- Insert expense
  insert into public.expenses (household_id, title, amount, date, payer_profile_id)
  values (p_household_id, p_title, p_amount, p_date, p_payer_profile_id)
  returning id into v_expense_id;

  -- Calculate equal split with remainder handling
  v_base_share := round(p_amount / v_count, 2);
  v_remainder := p_amount - (v_base_share * v_count);

  for v_i in 1..v_count loop
    v_pid := p_participant_ids[v_i];
    insert into public.expense_participants (expense_id, profile_id, share)
    values (
      v_expense_id,
      v_pid,
      case when v_i = 1 then v_base_share + v_remainder else v_base_share end
    );
  end loop;

  return jsonb_build_object('expense_id', v_expense_id);
end;
$$;

revoke all on function public.create_expense(uuid, text, numeric, date, uuid, uuid[]) from public;
grant execute on function public.create_expense(uuid, text, numeric, date, uuid, uuid[]) to authenticated;
