# 06 - Google OAuth consent publish + redirect audit (HIR-72)

**Ticket:** HIR-72  **Branch:** `hir-72/oauth-consent`  **Worktree:** `../hiro-oauth-consent`
**Platforms:** web + mobile (mostly config/docs)  **Size:** S  **Group:** 2 (**after 05 merges**)

## Context
OAuth **code already works**: web Google sign-in (PR #27) and mobile PKCE (PR #36) are merged. The remaining risk is operational: the Google consent screen is in "testing" mode, so **non-test friends get rejected**, and redirect URIs must match the deployed origins.

## Do (code/docs)
1. **Audit redirect URIs** in code against the real deployed origins:
   - Mobile scheme `hiro://auth/callback` (app.json `scheme: "hiro"`).
   - Web callback is moot (web/Vercel dropped, mobile-only) - focus on the mobile `hiro://` scheme.
   - Confirm the Supabase client redirect config matches for mobile.
2. **Write the founder runbook** `docs/v0.1.3/oauth-go-live.md` with exact, click-by-click steps:
   - Google Cloud Console: publish the OAuth consent screen to **Production** (and what scopes/justification are needed); add authorized redirect URIs + JavaScript origins.
   - Supabase: Site URL + Redirect URLs to add (prod web origin, `hiro://auth/callback`).
   - The account-consolidation step (which Google account owns the OAuth client) per HIR-72.
3. List anything that must be verified on a real device/browser after the founder flips it live.

## Acceptance
- Redirect URIs in code verified correct for prod; any mismatch fixed.
- A precise founder runbook exists so a non-test user can sign in with Google in production.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green).
- **Route:** after founder completes `oauth-go-live.md`, a NON-test Google account signs in on web + mobile.
- **Look for:** sign-in succeeds with no "app not verified / access denied" wall.
- **Pass/fail:** Pass = non-test Google sign-in works on both platforms. Fail = consent wall or redirect mismatch.
