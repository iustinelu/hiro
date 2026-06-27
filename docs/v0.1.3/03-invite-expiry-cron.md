# 03 - Invite expiry has no scheduler

**Ticket:** (no Linear #) - "Schedule expire_stale_invites"
**Branch:** `fix/invite-expiry-cron`  **Worktree:** `../hiro-invite-expiry-cron`
**Platforms:** Supabase (DB)  **Size:** S/M  **Group:** 1 (parallel-safe)

## Problem
`public.expire_stale_invites()` is defined (`supabase/migrations/20260403100000_invite_lifecycle.sql:256`) but **nothing ever calls it**, so stale/pending invites never transition to expired on their own. They only expire if something invokes the function.

## Do
1. Pick the mechanism (prefer **pg_cron** if available on the project - one migration, no extra infra):
   - Check `list_extensions`; enable `pg_cron` if needed and allowed.
   - Add a migration that schedules `expire_stale_invites()` to run periodically (e.g. hourly): `select cron.schedule('expire-stale-invites','0 * * * *', $$ select public.expire_stale_invites(); $$);`
   - If pg_cron is not viable, instead add a small Supabase **edge function** + a scheduled trigger, and document it.
2. Confirm the function's security/permissions still hold (it's `revoke all from public; grant execute to authenticated`) - the scheduler runs as the cron/postgres role, so verify it can execute.
3. New migration must pass `npm run check:migrations`.

## Acceptance
- Stale invites get expired automatically on a schedule, with no client involvement.
- Verify: insert a pending invite with an `expires_at` in the past, run the function (or wait for the job), confirm its status becomes expired and it can no longer be accepted.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green, incl. migrations check).
- **Route:** N/A (backend). Verification is via SQL: create an expired-dated pending invite -> trigger the job/function -> confirm status flips and `accept_invite` rejects it.
- **Look for:** the scheduled job exists (`select * from cron.job;` if pg_cron) and expiry actually happens.
- **Pass/fail:** Pass = schedule present + expiry verified + accept rejected. Fail = no schedule, or expired invite still acceptable.
