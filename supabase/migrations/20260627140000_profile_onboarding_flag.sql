-- HIR-69: per-profile flag gating the interactive first-win onboarding tour.
--
-- The tour is a layer over Home, separate from the existing household gate
-- (RootNavigator.checkOnboarded = display name + household). This flag controls
-- only the gamified tour so it auto-launches once for a new user and never
-- re-triggers afterwards (Replay re-runs it from the More tab in-memory).
--
-- No new RLS policy: profiles_update_self (own-row update, defined in
-- 20260228194000_baseline_households.sql) already covers this column. New
-- signups insert via profiles_insert_self without setting it, so it defaults to
-- false and the tour triggers; existing users are backfilled to true below so
-- they never see it.

alter table public.profiles
  add column onboarding_completed boolean not null default false;

-- Existing users have already been through the app; do not show them the tour.
update public.profiles set onboarding_completed = true;
