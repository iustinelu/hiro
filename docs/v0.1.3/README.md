# Hiro v0.1.3 - "The Big One" - agent dispatch index

This folder holds **paste-able agent briefs** for the v0.1.3 release.
Each `NN-slug.md` is a standalone prompt: spawn one agent per brief, in its own git worktree, and it builds + self-verifies one ticket.
Full program + rationale: `~/.claude/plans/` v0.1.3 plan. Source-of-truth state was verified against code on 2026-06-27 (roadmap.md is stale; the app is core-complete).

> **MOBILE-FIRST (2026-06-27):** Hiro is now 100% focused on mobile. The web app is deprioritized. For every brief: **prioritize mobile, verify on the Android emulator harness; web parity + web Playwright QA are optional/secondary.** Web-only tickets are deferred to a later wave.

## Shared contract (every build agent follows this)
1. **Worktree isolation:** `git worktree add ../hiro-<slug> -b <branch> main`. Copy gitignored env from the main checkout into the worktree: `apps/web/.env.local` and `apps/mobile/.env`; restart Metro so `EXPO_PUBLIC_*` reload.
2. **Read first:** `docs/architecture-standards.md`, `supabase/README.md`, and the files your ticket touches. Reuse existing patterns; do not invent new ones.
3. **Web + mobile mirror 1:1.** The service layers (`apps/web/src/lib/*Service.ts` and `apps/mobile/src/lib/*Service.ts`) are kept in sync - change both.
4. **Theming rule (lint-enforced):** web uses `cssColor`/token CSS vars, mobile uses `useTheme()`. Never hardcode colors/fonts/radii. All 4 themes (aurora/daylight/superchore/neon) must look right.
5. **Database:** every RLS policy uses the `current_profile_id()` / `current_household_ids()` SECURITY DEFINER helpers (never sub-select membership tables). Run a **denial test** (`set local role anon`) for every new policy. Migrations are timestamp-named; native deps go in `apps/mobile/package.json` (not root - that caused the 0.1.1 crash).
6. **Self-verify before claiming done (MANDATORY, evidence before assertions):**
   - `npm run check` green from repo root.
   - **Mobile (primary):** use the E-A emulator harness (`docs/v0.1.3/mobile-qa-harness.md`) to launch + screenshot the flow. This is the required proof for mobile work.
   - **Web (optional/secondary):** since we're mobile-first, only drive the web flow with Playwright if the change is web-relevant; otherwise skip. If the emulator harness isn't ready yet, say so explicitly.
7. **Do NOT merge.** End with a filled-in **Founder QA Quick Cycle** (Commands / Route / Look for / Pass-fail). Commit on your branch, push, open a PR with plain `gh pr create` (no governance template). Founder QA -> founder merges -> `git worktree remove`.

## Dispatch order + status

| # | Ticket | Brief | Group | Depends on | Status |
|---|--------|-------|-------|-----------|--------|
| E-A | infra | `E-A-mobile-qa-harness-setup.md` | Enabler | - | ⏳ spawn in own session |
| E-B | HIR-68 | (agent, output `ia-decision.md`) | Enabler | - | ⏳ running |
| E-C | readiness | (agent, output `readiness-addendum.md`) | Enabler | - | ⏳ running |
| 01 | (config) | `01-invite-url-env.md` | G1 | founder: prod web origin | ⏳ |
| 02 | HIR-65 | `02-web-tab-lag.md` | G1 | - | ⏸️ **deferred (web-only, mobile-first)** |
| 03 | (invites) | `03-invite-expiry-cron.md` | G1 | - | ⏳ |
| 04 | (polish) | `04-budget-focus-refetch.md` | G1 | E-A (mobile QA) | ⏳ |
| 05 | HIR-71 | `05-account-linking.md` | G2 | - | ⏳ |
| 06 | HIR-72 | `06-oauth-consent.md` | G2 | 05 merged; founder console | ⏳ |
| 07 | HIR-69 | `07-onboarding.md` | G3 | E-B (IA) | ⏳ |
| 08 | HIR-70/67 | `08-adhoc-tasks.md` | G3 | **E-B (IA decision)** | ⏳ gated |
| 09 | HIR-66 | `09-push-notifications.md` | G3 | E-A; founder: APNs/FCM | ⏳ |
| 10 | HIR-63 | `10-branded-emails.md` | G3 | founder: Resend key | ⏳ |
| 11 | (store req) | `11-account-deletion.md` | G4 | - | ⏳ |
| 12 | (quality) | `12-tests-error-enums.md` | G4 | merge after F2 | ⏳ |
| 13 | (quality) | `13-mobile-empty-and-error-states.md` | G1/G4 | E-A (mobile QA) | ⏳ (from E-C audit) |

**Concurrency:** Group 1 can all run at once. Run 05 before 06 (shared auth files). Group 3 after enablers (08 strictly after the IA decision). Merge B2(02) and F2(08) early to minimize rebases. **Cap concurrent emulator-using agents at ~2** (each runs Metro + an emulator).

## Founder-owned config side track (run in parallel; unblocks agents)
Vercel prod env + domain (unblocks 01 origin + redirect URLs) -> Supabase Site/Redirect URLs -> Google consent publish (unblocks 06) -> APNs/FCM keys (unblocks 09) -> Resend key+domain (unblocks 10) -> store listing + **privacy policy URL (P0: Google Play rejects uploads without one)**.

## Deferred web-only findings (from E-C audit; mobile-first = not this wave)
Logged for later, not built now: PWA manifest 307-redirects to sign-in (`middleware.ts` matcher) so PWA won't install; duplicate desktop wordmark + floating title (`tabs-layout.module.css` hides `.mobileTabs` but not `.mobileHeader`); unguarded `/design-system` + `/dev/error-test` routes in prod. Full list: `docs/v0.1.3/readiness-addendum.md`.
