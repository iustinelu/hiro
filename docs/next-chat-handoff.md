# Session handoff — 2026-06-26 (launch day: crash fixed, Android + iOS live, auth working)

## TL;DR for the orchestrator
Both apps are **fixed, installable, and crash-free**, Google sign-in **works**, store auto-submit is **live for Android + iOS**, and there's a big, well-specced backlog (HIR-67…HIR-79) ready to execute. Tomorrow = **pile features into 0.1.2**. `main` is clean, `npm run check` is green.

## Current deployed state
| Surface | Version | Where | Notes |
|---|---|---|---|
| Android | 0.1.1 (versionCode 4) | Play **internal** track | crash fixed; auto-submitted via `eas submit` |
| iOS | 0.1.1 (build 2) | **TestFlight** (internal) | verified on founder's iPhone, working |
| Founder's Pixel | **0.1.2 preview APK** (sideloaded) | not released | has the PKCE Google-OAuth fix; Google sign-in verified working here |

⚠️ **IMPORTANT:** the **PKCE Google-OAuth fix is on `main` (0.1.2) but NOT yet in the store/TestFlight builds.** Play internal (0.1.1) and TestFlight (0.1.1) still have the *broken* implicit-flow Google sign-in. Working Google auth reaches stores only when **0.1.2 is built + submitted** (part of tomorrow's push). Founder's instruction tonight: do an Android check only, **no release** today.

## What shipped today (all merged to `main`)
1. **`create_household` overload bug** — dropped the redundant 1-arg RPC; migration applied to live DB; verified. ([[project_mobile_crash_native_module]] sibling: see migration guard.)
2. **Play Store launch crash** — root cause via on-device `adb logcat`: `Cannot find native module 'ExpoWebBrowser'`. `expo-web-browser` was in the **root** `package.json`, not `apps/mobile` → not autolinked into the standalone build. Moved it. ([[project_mobile_crash_native_module]])
3. **Mobile Google OAuth** — `createMobileClient` defaulted to `flowType: implicit`, breaking the PKCE `exchangeCodeForSession` path. Set `flowType: "pkce"`. Founder added `hiro://auth/callback` + `hiro://**` to Supabase redirect URLs. Verified on Pixel. ([[project_mobile_google_oauth]])
4. **Test infra (was a placeholder)** — Vitest live (`npm run test`), unit tests for `validateRuntimeEnv` + `formatCurrency`; **`scripts/check-migrations.mjs`** (function-overload + RPC-exists guard) and a **native-dep guard** in `check-mobile-runtime.mjs`. Both wired into `npm run check` + CI. Both verified to catch their bug class.
5. **EAS auto-submit for Android + iOS** — no manual store uploads. ([[project_eas_autosubmit]])
6. Fail-soft env handling in `apps/mobile/src/lib/supabase.ts` (config-error screen instead of crash); docs: launch runbook postmortem + preview-before-prod gate, `docs/dev-process-improvements.md` (the "1%/session" log).

## Tomorrow's plan: 0.1.2 feature push
`app.json` is already at **0.1.2**. The backlog (all in Linear, project **Hiro MVP**, full specs in each ticket):

**Build (features):**
- **HIR-69 (High)** — Interactive onboarding (researched; guided-first-win, gamified). Likely the priority; also a prerequisite for the beta.
- **HIR-70 (High)** — Ad-hoc tasks: self-assigned points + contest/settle + activity board. **Mandates spawning a UX-research subagent** before building.
- **HIR-67** — Household chore backlog (claimable one-offs). Overlaps HIR-70 — reconcile.
- **HIR-71 (High)** — Auth: offer to link sign-in methods instead of "sign-in failed".

**Decide / research (do before or alongside):**
- **HIR-68** — App IA research spike (gates placement of HIR-67/69/70).
- **HIR-72 (High)** — Verify/fix Google OAuth config (consent-screen publish for non-test users) + which account owns it.
- **HIR-73** — One vs. multiple households per user (founder leans one; current `accept_invite_and_leave` already does join-new=leave-old).
- **HIR-74** — Consolidate all infra under one owner account (account sprawl).
- **HIR-75/76/77** — Monetization / beta timing / influencer strategy (deep-research agents).
- **HIR-78** — Evaluate Linear → Beads for agentic dev.
- **HIR-79 (High)** — Stand up the fully automated agent dev cycle (plan→spec→implement→test→evals) + agent-run mobile/web tests on the Claude Team sub.

## Deploy mechanics (proven today)
- **Build:** from `apps/mobile/`: `npx eas-cli build --profile production --platform android|ios` (preview profile → APK for the on-device gate). versionCode/buildNumber auto-increment (`appVersionSource: remote`).
- **Submit:** `npx eas-cli submit --profile production --platform android|ios --id <buildId>`. Android → Play internal track; iOS → App Store Connect (ascAppId `6784593514`, EAS-managed ASC key). The CLI's wait often dies on a transient `GraphQL request failed` — submission still completes; poll EAS GraphQL `submissions{byId(submissionId){status}}` with the `expo-session` token from `~/.expo/state.json`.
- **On-device gate (MANDATORY before prod):** preview APK → `adb install` → launch → verify. Founder's Pixel connects over USB (set USB mode to **File transfer**, not tethering, or `adb` won't see it; product id should be `4ee2`/`4ee7`).
- **TestFlight:** internal = no review (instant once processed); external = needs Beta App Review. Use internal to dogfdood fast.

## Process notes
- **Founder pre-authorizes autonomous commit/push/PR/merge** (gh logged in). Branch for code, `npm run check`, then PR + merge (`--admin` to bypass the scrapped `pr-governance` CI check, which always fails by design). Docs/handoff commits go direct to `main`. PR governance is scrapped — plain `gh pr create`.
- **Continuous improvement is a standing ask** ([[feedback_continuous_improvement]]): every session leave the dev process ≥1% better; log it in `docs/dev-process-improvements.md`. When fixing a bug, add the cheapest guardrail for its class.
- `npm run check` chain: boundaries → governance → **migrations** → expo-root-artifacts → mobile-runtime (incl. native-dep guard) → lint → typecheck → **test**.
- No emulator/simulator on this Linux box — mobile QA is on the founder's connected devices (Pixel via adb; iPhone via TestFlight).
- THE THEMING RULE still enforced by `scripts/lint.mjs`: themed values must be reactive (web `cssColor/…`, mobile `useTheme()`); 4 themes aurora/daylight/superchore/neon.

## Open config (not blocking today, needed for full launch)
- **Web prod (Vercel):** project + `NEXT_PUBLIC_*` env + domain + Supabase redirect URLs not done yet (launch runbook Track A). Web Google sign-in works locally (JS origin `localhost:3000`); prod domain must be added to the OAuth client + Supabase.
- **Google OAuth consent screen:** publish to production (or add testers) so non-test users can sign in (HIR-72).

## Reference
- Supabase project `pfokfopwjrahclmseper` (eu-central-1; one project for dev+prod). Auth helpers `current_profile_id()`/`current_household_ids()` (SECURITY DEFINER) — always use in RLS.
- Key docs: `docs/launch/README.md` (runbook + crash postmortem + auto-submit setup), `docs/dev-process-improvements.md`, `docs/architecture-standards.md` (now includes Function/RPC rules).
- Memory index: `MEMORY.md` — see [[project_eas_autosubmit]], [[project_mobile_google_oauth]], [[project_mobile_crash_native_module]], [[feedback_continuous_improvement]].
