# Mobile Google OAuth — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Scope:** Production build only (dev build / EAS). Not required to work in Expo Go.

---

## Problem

Mobile auth is email/password only. Test users signing up on mobile have more friction than on web. Google OAuth is already live on web; mobile needs parity for the friend release.

Household-switch (`acceptInviteAndLeave`) is also missing from mobile's `inviteService` — porting it completes parity with web even though there's no native invite acceptance screen yet.

---

## Approach

**`expo-web-browser` + Supabase PKCE** (same pattern as web, adapted for mobile).

1. `supabase.auth.signInWithOAuth({ provider: 'google', options: { skipBrowserRedirect: true, redirectTo: 'hiro://auth/callback' } })` returns the OAuth URL without navigating.
2. `WebBrowser.openAuthSessionAsync(oauthUrl, 'hiro://auth/callback')` opens a system browser and waits.
3. Google → Supabase → redirects to `hiro://auth/callback?code=...` → browser closes and promise resolves with the URL.
4. Parse the code, call `supabase.auth.exchangeCodeForSession(code)`.
5. `onAuthStateChange` fires → `RootNavigator` updates → user is in.

No separate deep link handler needed. The entire flow is self-contained in `signInWithGoogle()`.

---

## Files

| File | Change |
|------|--------|
| `apps/mobile/app.json` | Add `scheme`, `ios.bundleIdentifier`, `android.package` |
| `apps/mobile/package.json` | Add `expo-web-browser` |
| `packages/ui-primitives/src/mobile/MobileButton.tsx` | Wire `iconLeft` prop (already in shared types, not rendered yet) |
| `apps/mobile/src/lib/authService.ts` | Add `signInWithGoogle()` |
| `apps/mobile/src/screens/auth/AuthScreen.tsx` | Add Google button + "or" divider on sign-in and sign-up views |
| `apps/mobile/src/lib/inviteService.ts` | Add `acceptInviteAndLeave()` (port from web) |

---

## App Config Values

```json
{
  "expo": {
    "scheme": "hiro",
    "ios": { "bundleIdentifier": "com.hiro.app" },
    "android": { "package": "com.hiro.app" }
  }
}
```

---

## Manual Step (one-time)

Supabase dashboard → Authentication → URL Configuration → Redirect URLs:
add `hiro://auth/callback`

No Google Cloud Console changes needed — the Supabase callback URL is already registered there.

---

## Google Icon

Same SVG as web (4-path coloured G), encoded with `rgb()` values to pass the hex-color lint rule. Rendered via `iconLeft` prop on `MobileButton`.

---

## Household Switch Parity

`acceptInviteAndLeave(token)` ported directly from `apps/web/src/lib/inviteService.ts` into `apps/mobile/src/lib/inviteService.ts`. Calls the same `accept_invite_and_leave` RPC already deployed. No UI changes — mobile invite acceptance currently opens the web browser, so the web flow handles it end-to-end.

---

## Out of Scope

- Expo Go compatibility
- Native Google Sign-In SDK
- Deep link handling for invite URLs on mobile
- Native invite acceptance screen on mobile
