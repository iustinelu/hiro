# Hiro v0.1 — Launch runbook

Two distribution tracks. Track A (web) is the fastest path to a live URL; Track B (native) is
the founder's stated goal but gated on store-account approvals (start those today — they're the
long pole).

**One-database note:** there is a single Supabase project (`pfokfopwjrahclmseper`, eu-central-1)
used for both dev and prod. Launching means real users hit the same project that's been used for
development. For v0.1 this is an accepted single-project setup. The Supabase **anon/publishable
key is public by design** (it ships inside both the web bundle and the native binary), so it is
committed in `eas.json` / set as a Vercel public env var — that is not a secret leak.

---

## Track A — Web (Vercel)

The web target is `apps/web` (Next.js 15). No `vercel.json` is used — monorepo wiring is done in
the Vercel project settings instead.

### Founder steps (Vercel dashboard)
1. **Create / connect the Vercel project** to the `iustinelu/hiro` repo.
2. **Root Directory:** `apps/web`. Leave "Include source files outside Root Directory" **on**
   (needed so the workspace `@hiro/*` packages resolve).
3. **Framework preset:** Next.js (auto-detected). Build command + output: defaults.
4. **Environment variables** (Production + Preview):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_APP_ENV` | `production` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://pfokfopwjrahclmseper.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_nxVa3C3rzwfVbs-Dudv0Zw_9lEy0CKr` |

   (Google OAuth client id/secret are **not** app env vars — they live in the Supabase dashboard.)
5. **Deploy.** Note the assigned `*.vercel.app` URL (or attach a custom domain).

### Supabase auth config (after the URL is known)
In Supabase → Authentication → URL Configuration, add the Vercel URL (and custom domain) to:
- **Site URL**
- **Redirect URLs** (`https://<domain>/**`)

Without this, Google OAuth + magic-link redirects bounce.

> **Google OAuth production go-live (consent publish + redirect audit):** see the click-by-click
> founder runbook at [`docs/v0.1.3/oauth-go-live.md`](../v0.1.3/oauth-go-live.md) (HIR-72). It
> covers publishing the consent screen out of "Testing" mode (the thing that blocks non-test
> friends), the exact two redirect values to register, and project/account consolidation. Note:
> as of v0.1.3 distribution is **mobile-only**, so the runbook targets the native flow
> (`hiro://auth/callback`); the web/Vercel steps above are parked.

---

## Track B — Native iOS + Android (EAS)

EAS is signed in as **justins9269** (owner of `justins9269s-team`), project linked
(`projectId b732bece-946b-4fc7-8407-7088f6ef4873`), bundle IDs `com.behiro.app` on both platforms.

### Done in repo
- `apps/mobile/eas.json` — `preview` (internal testers) + `production` (store) profiles,
  `appVersionSource: remote` + `autoIncrement` so build numbers self-manage. Prod
  `EXPO_PUBLIC_*` env baked into both profiles.
- `submit.production` profile wired for **automated upload** (`eas submit`) to both stores — see
  "Automated submission" below.

### Crash postmortem (2026-06-26) — the first Play Store build crashed on launch
**Confirmed root cause (via on-device `adb logcat`):**
`FATAL EXCEPTION ... JavascriptException: Error: Cannot find native module 'ExpoWebBrowser'`.
`expo-web-browser` was declared in the **monorepo root `package.json`**, not in
`apps/mobile/package.json`, and is imported at startup (`authService.ts`) + listed in `app.json`
plugins. Expo Go bundles every SDK native module so it worked there, but a standalone EAS build
only autolinks native modules from the **app's own** dependencies → the `ExpoWebBrowser` native
module was never compiled in → `requireNativeModule` threw on launch. This was the first
standalone build ever, so the latent misplacement had never surfaced (all prior QA was Expo Go).

Fix: moved `expo-web-browser` into `apps/mobile/package.json`; `npm install`; rebuild.

Two earlier hypotheses were **investigated and ruled out** before the logcat (recorded so we don't
re-chase them): (1) *missing env* — disproved by extracting the live AAB's Hermes bundle and
finding the Supabase URL + anon key correctly baked in; (2) *New Architecture mismatch
(`newArchEnabled: false`)* — plausible but not the cause.

Defensive fixes shipped alongside (keep regardless — they harden against future mistakes):
- **`scripts/check-mobile-runtime.mjs`** now fails if any `expo-*`/`@expo/*`/`react-native-*`
  package imported in `apps/mobile/src` (or named in `app.json` plugins) is not declared in
  `apps/mobile/package.json`. This is the guardrail that would have caught this crash pre-build.
- `supabase.ts` is **fail-soft**: a missing-env throw now renders a "Configuration error" screen
  instead of an instant crash; `validateRuntimeEnv` has a unit test locking the contract.

### ⚠️ Preview-before-production gate (MANDATORY)
**No production mobile build is submitted until an internal `preview` build has been verified
on a real device.** The first store binary crashed on launch and there was no on-device check
between build and submit. Always: `eas build --profile preview` → install → confirm launch +
core flow → only then `eas build --profile production` → `eas submit`.

### Founder steps — store accounts (THE LONG POLE, start now)
1. **Apple Developer Program** enrollment for the team — ~24–48h to approve. Required before any
   TestFlight build. ($99/yr)
2. **Google Play Console** developer account ($25 one-time) + a service-account JSON for
   `eas submit` (EAS can also walk you through this on first submit).

### Build sequence (once accounts exist)
```bash
# from apps/mobile/
# first build per platform prompts to create/manage signing credentials — let EAS manage them
npx eas-cli build --profile preview --platform android   # APK for sideload / internal testers
npx eas-cli build --profile preview --platform ios       # needs registered test devices
# --- verify the preview build on a real device (MANDATORY gate) ---
# store builds:
npx eas-cli build --profile production --platform android # AAB for Play
npx eas-cli build --profile production --platform ios     # IPA for App Store / TestFlight
# submit:
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

### Automated submission (no manual Play Console / App Store Connect upload)
`eas submit` uploads the built artifact straight to the stores using the `submit.production`
block in `eas.json`. One-time secret setup (files live in `apps/mobile/credentials/`, which is
gitignored — never commit them):

- **Android** → `serviceAccountKeyPath: ./credentials/google-play-service-account.json`
  1. Play Console → Setup → API access → create / link a Google Cloud service account.
  2. Grant it the "Release to testing tracks" + "Release apps to production" permissions.
  3. Download its JSON key to `apps/mobile/credentials/google-play-service-account.json`.
  - Submits to the `internal` track as a `draft` (see eas.json). Promote in Play Console.
  - **First-ever upload caveat:** Google requires the *first* AAB of a brand-new app to be
    uploaded by hand in Play Console once; `eas submit` automates every release after that.
- **iOS** → App Store Connect API key (`.p8`) + key id + issuer id.
  1. App Store Connect → Users and Access → Integrations → App Store Connect API → generate key.
  2. Save the `.p8` to `apps/mobile/credentials/asc-api-key.p8`.
  3. Replace `REPLACE_WITH_ASC_API_KEY_ID` / `REPLACE_WITH_ASC_API_KEY_ISSUER_ID` in `eas.json`.
  - (Alternatively store all of these with `eas credentials` instead of file paths.)

Once configured: `npx eas-cli submit --profile production --platform android` (or `ios`) does the
upload with zero manual steps. Store *review/rollout* is still done in the consoles.

### Still open before a clean store submission
- **App Store / Play listing assets** — app icon (have it), screenshots, description, privacy
  policy URL, age rating. (Play requires a privacy policy URL even for internal testing tracks.)
- **`expo-updates`** is NOT installed → no OTA. Every JS change needs a new native build for now.
  Fine for v0.1; revisit if iteration speed hurts.

---

## Blocker summary (founder-owned)

| Blocker | Track | Lead time |
|---|---|---|
| Apple Developer Program enrollment | B | ~24–48h ⏳ start today |
| Google Play Console account | B | minutes |
| Vercel project + prod env | A | minutes |
| Supabase auth redirect URLs | A | minutes (after URL known) |
| Supabase Pro vs free tier (free auto-pauses) | A + B | decision |
| Store listing assets + privacy policy URL | B | hours |
