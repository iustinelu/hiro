-- Schedule public.expire_stale_invites() to run periodically.
--
-- The function (20260403100000_invite_lifecycle.sql) bulk-flips pending invites
-- whose expires_at is in the past to 'expired', but nothing ever called it on a
-- schedule. Pending invites that no one touches stayed 'pending' forever (even
-- though accept_invite would still reject them). pg_cron gives us true background
-- expiry with no client involvement and no extra infra.
--
-- Permissions: the cron job runs as the role that scheduled it (postgres, since
-- migrations apply as postgres), which bypasses the function's
-- `revoke all from public; grant execute to authenticated` restriction. The
-- function is SECURITY DEFINER, so the UPDATE runs with its owner's privileges.

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Hourly. Idempotent: cron.schedule upserts by jobname, so re-applying is safe.
select cron.schedule(
  'expire-stale-invites',
  '0 * * * *',
  $$ select public.expire_stale_invites(); $$
);
