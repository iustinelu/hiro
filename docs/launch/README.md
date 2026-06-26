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

---

## Track B — Native iOS + Android (EAS)

EAS is signed in as **justins9269** (owner of `justins9269s-team`), project linked
(`projectId b732bece-946b-4fc7-8407-7088f6ef4873`), bundle IDs `com.hiro.app` on both platforms.

### Done in repo (this session)
- `apps/mobile/eas.json` created — `preview` (internal testers) + `production` (store) profiles,
  `appVersionSource: remote` + `autoIncrement` so build numbers self-manage. Prod
  `EXPO_PUBLIC_*` env baked into both profiles.

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
# store builds:
npx eas-cli build --profile production --platform android # AAB for Play
npx eas-cli build --profile production --platform ios     # IPA for App Store / TestFlight
# submit:
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

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
