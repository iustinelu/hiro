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
