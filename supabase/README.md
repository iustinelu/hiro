# supabase Ownership

- SQL migrations and RLS policies only.
- Migrations are the single source of truth for schema.

## Precision Mandate

**Migrations and RLS are production-critical and extremely difficult to fix once deployed.** A bad migration requires downtime and data surgery. A misconfigured RLS policy silently leaks data across households. There is no patch-and-retry here.

Agents working in this directory must:

1. **Read the full migration file** before applying or modifying.
2. **Apply only idempotent, verified SQL** — test destructive changes against a branch first.
3. **Verify after every apply:**
   - `list_migrations` confirms the migration is recorded.
   - `list_tables` confirms RLS is enabled on all household-scoped tables.
   - `execute_sql` on `pg_policies` confirms policy count and names match spec.
4. **Write and run a denial test** for any new RLS policy before closing the ticket.
5. **Never skip verification** and never claim "it probably worked."

## Naming Convention

- File: `{timestamp}_{snake_case_description}.sql` (e.g. `20260228194000_baseline_households.sql`)
- Policy names: `{table}_{action}_{scope}` (e.g. `households_select_member`)
- All primary keys: UUID (`gen_random_uuid()`)
- All tables: `created_at timestamptz`, `updated_at timestamptz`

## RLS Policy Template

Every household-scoped table must have explicit `USING` and `WITH CHECK` clauses. Default-deny is enforced by Postgres when RLS is enabled and no permissive policy matches — do not add explicit deny policies unless testing edge cases.

## SECURITY DEFINER auth-method helpers (HIR-71)

`20260627000000_account_methods_lookup.sql` adds two `SECURITY DEFINER` functions that read the `auth` schema so the auth UI can route a user to the sign-in method their account actually uses (instead of a generic "sign-in failed" dead-end):

- `account_methods_for_email(p_email text) -> text[]` — granted to `anon, authenticated`. Returns the method(s) for an email: `{email}`, `{google}`, `{email,google}`, or `{}` if no account. Password is detected via `auth.users.encrypted_password`; Google via `auth.identities`.
- `current_account_methods() -> text[]` — granted to `authenticated` only. Same array for the logged-in user (`auth.uid()`), used to gate the "Set a password" affordance.

**Enumeration tradeoff:** `account_methods_for_email` is intentionally callable by `anon`, which lets an unauthenticated caller learn whether an email is registered and with which provider. This is an accepted, low-risk tradeoff for a friends-and-family product and can be rate-limited later. Because Supabase grants EXECUTE on `public` functions to `anon`+`authenticated` by default, `current_account_methods` must explicitly `revoke ... from public, anon` (revoking from `PUBLIC` alone is insufficient). A denial test (`set local role anon`) confirms `anon` cannot call `current_account_methods`.
