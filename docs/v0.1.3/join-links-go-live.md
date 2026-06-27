# Join links go-live runbook - tappable household invite links (HIR-73)

**Audience:** founder. **Outcome:** a household's invite link
(`https://<host>/join/<code>`) opens the Hiro app straight into a "Join household?"
confirm when tapped (WhatsApp, email, SMS, anywhere), or a landing page with store
buttons when the app isn't installed. No invite emails - distribution is the user's
own share sheet.

Like the push-notifications work, the **code ships now**; this runbook is the set of
switches you flip to make tappable links work end-to-end. Until then, the in-app
**code-paste** join already works (share the link/code via the share sheet; the
recipient pastes the code in "Join a household").

> The DB migration (`supabase/migrations/20260627000000_household_join_links.sql`) is
> already applied to the Hiro project (`pfokfopwjrahclmseper`). No DB action needed
> unless you spin up a fresh project (then `apply_migration` it).

---

## What you need
- The free Vercel (or Cloudflare Pages / Netlify) account to deploy `apps/web` as the
  link resolver.
- Apple Developer **Team ID** (10-char, e.g. `A1B2C3D4E5`).
- The Android signing cert **SHA-256** fingerprint(s).

---

## Step 1 - Deploy the link resolver (`apps/web`) to a free subdomain
1. Create a Vercel project from this repo, root `apps/web` (framework: Next.js).
2. Set its env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (same values as `apps/mobile/eas.json`), and `NEXT_PUBLIC_APP_ENV=production`.
3. Deploy. Note the assigned subdomain, e.g. `hiro-xyz.vercel.app` - this is
   **`<host>`** everywhere below.
4. Confirm it serves:
   - `https://<host>/.well-known/apple-app-site-association` (JSON, `content-type: application/json`)
   - `https://<host>/.well-known/assetlinks.json` (JSON)
   - `https://<host>/join/<any-uuid>` (landing page; shows "isn't active" for a bogus code)

## Step 2 - Fill the verification files with real fingerprints
These ship with placeholders. Replace and redeploy:
- `apps/web/src/app/.well-known/apple-app-site-association/route.ts`:
  replace `__APPLE_TEAM_ID__` so `appID` is `<TEAMID>.com.behiro.app`.
- `apps/web/src/app/.well-known/assetlinks.json/route.ts`:
  replace `__ANDROID_SHA256__` with your Android signing SHA-256. Get it from
  `eas credentials` (Android → Keystore → SHA-256), **and** add the **Google Play App
  Signing** SHA-256 (Play Console → Setup → App signing) once the app is uploaded -
  Play re-signs, so include BOTH fingerprints in the `sha256_cert_fingerprints` array.

## Step 3 - Point the app at `<host>`
1. `apps/mobile/app.json`: replace the placeholder host `hiro.example.com` with
   `<host>` in **both** `ios.associatedDomains` (`applinks:<host>`) and
   `android.intentFilters[].data.host`.
2. `apps/mobile/eas.json`: set `EXPO_PUBLIC_WEB_ORIGIN` to `https://<host>` in **both**
   the `preview` and `production` profiles (replace the `https://hiro.example.com`
   placeholder). For local dev, set it in `apps/mobile/.env` too.

## Step 4 - Rebuild the app (native config changed - no OTA)
`associatedDomains` / `intentFilters` are native; they only take effect in a fresh
binary. Run an EAS build (preview to test, then production) and install it.

## Step 5 - Verify association
- **iOS:** Apple's CDN caches the AASA. After install, tapping a `https://<host>/join/<code>`
  link (e.g. from Notes/Messages) should open Hiro. If not, check
  `https://app-site-association.cdn-apple.com/a/v1/<host>` resolves your JSON.
- **Android:** `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://<host>&relation=delegate_permission/common.handle_all_urls`
  should list `com.behiro.app`. `adb shell pm get-app-links com.behiro.app` should show `verified`.

---

## End-to-end QA (after the above)
1. Owner: More → "Anyone with the link can join" ON → Copy/Share the link.
2. Send it to a second phone via WhatsApp.
3. App installed → tap → Hiro opens to "Join {household}?" → confirm → joined.
4. App NOT installed → tap → landing page with store buttons.
5. Owner toggles OFF (or Reset link) → the old link/code is rejected with a clear message.
6. A user already in a household → tapping/pasting prompts the data-loss switch confirm.

## Security notes
- The link is a shareable secret. Owners can **turn it off** (revoke) or **Reset link**
  (rotate) at any time - both immediately invalidate the old code.
- `get_household_by_code` (used by the landing page) exposes only household name +
  member count, never emails or IDs.
- Optional `expires_at` exists on `household_join_links` for time-boxed links (not yet
  surfaced in the UI; can be wired later).
