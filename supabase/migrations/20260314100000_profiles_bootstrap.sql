-- Profile auto-bootstrap trigger: creates a profiles row for every new auth user.
-- Uses SECURITY DEFINER so it can insert into public.profiles bypassing RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Fire after every new auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Resilience fallback: allow authenticated users to insert their own profile row
-- (covers edge cases where the trigger fires before session is fully established)
create policy "profiles_insert_self"
  on public.profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());
