# Google OAuth go-live runbook (HIR-72)

Goal: let a **non-test** Google account sign in to Hiro in production.

Today the Google consent screen is in **Testing** mode, so only allow-listed test users can sign
in.
Everyone else is hard-blocked with *"Access blocked: Hiro has not completed the Google
verification process"* (or *"...is being tested"*).
Testing mode also caps you at 100 test users and expires Google refresh tokens after 7 days.
Publishing the consent screen to **Production** removes all of that.

This is a **config-only** go-live.
No code change is needed (see the audit below) — these are dashboard steps only the founder can do.

> **Mobile-first / mobile-only (v0.1.3).**
> Hiro ships native-only right now; the web app is parked and there is **no production web deploy**.
> So this runbook targets the **mobile** Google sign-in flow.
> The web sign-in code is correct and origin-agnostic (audit below), but since there is no deployed
> web origin, there is nothing web-specific to register for production — only the local `localhost`
> origin matters, and only if you still run the web app in dev.

---

## 0. The one fact that matters

Hiro does **not** use a native Google iOS/Android OAuth client.
The mobile app opens Supabase's hosted auth URL in a system browser; **Supabase** is the OAuth
client that talks to Google, then Supabase redirects back into the app via the `hiro://` custom
scheme.

So the full chain is:

```
app  →  Supabase auth URL  →  Google consent  →  https://pfokfopwjrahclmseper.supabase.co/auth/v1/callback  →  hiro://auth/callback  →  app
```

That means only **two** redirect values ever need to be registered:

| Where | Value | Purpose |
|---|---|---|
| Google Cloud → OAuth client (Web application type) → **Authorized redirect URIs** | `https://pfokfopwjrahclmseper.supabase.co/auth/v1/callback` | Google → Supabase hop |
| Supabase → Authentication → URL Configuration → **Redirect URLs** | `hiro://auth/callback` | Supabase → app hop |

Everything else below is about **publishing** the consent screen and **consolidating** ownership.

---

## 1. Google Cloud Console

Open <https://console.cloud.google.com/> and select the **canonical Hiro project** (see §3 on
ownership — likely `hiro-500619`, the project that owns the EAS Play service account).

### 1a. Verify the OAuth client redirect URI

1. **APIs & Services → Credentials**.
2. Under **OAuth 2.0 Client IDs**, open the **Web application** client that Supabase uses.
3. Confirm **Authorized redirect URIs** contains exactly:
   - `https://pfokfopwjrahclmseper.supabase.co/auth/v1/callback`
4. **Authorized JavaScript origins**: not required for the mobile flow.
   Add `http://localhost:3000` only if you still run the web app locally in dev.
   Leave production web origins empty — there is no web prod deploy.
5. Copy the **Client ID** and **Client secret**; you will confirm them in Supabase in §2.

### 1b. Publish the OAuth consent screen to Production

1. **APIs & Services → OAuth consent screen**.
2. **User type** must be **External**.
3. Fill the required fields if not already set:
   - **App name**: `Hiro`
   - **User support email**: founder email
   - **App logo** (optional)
   - **Authorized domains**: add `supabase.co` (needed because the callback lives on
     `pfokfopwjrahclmseper.supabase.co`).
   - **Developer contact information**: founder email
4. **Scopes**: confirm only the **non-sensitive** scopes are listed:
   `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   Do **not** add any sensitive or restricted scopes.
5. Back on the OAuth consent screen, find **Publishing status: Testing** and click
   **PUBLISH APP**, then confirm in the dialog.
6. Publishing status should now read **In production**.

> **No verification review is required.**
> Google's app-verification / brand-review process is only triggered by **sensitive or restricted**
> scopes.
> Hiro requests only `openid email profile`, which are non-sensitive, so publishing is a one-click
> action with no review queue and no waiting.

---

## 2. Supabase dashboard

Open the Hiro project (`pfokfopwjrahclmseper`) at <https://supabase.com/dashboard/>.

### 2a. Confirm the Google provider

1. **Authentication → Providers → Google**.
2. **Enabled** is on.
3. **Client ID** and **Client secret** match the values from §1a.
   (Google sign-in already works in test mode, so these should already be correct — just verify.)

### 2b. Confirm the redirect allow-list

1. **Authentication → URL Configuration**.
2. **Redirect URLs** must include:
   - `hiro://auth/callback`  ← **required for mobile**
   - `http://localhost:3000/**`  ← optional, only for local web dev
3. **Site URL**: with no web production deploy this value is not used by the mobile flow.
   Leave the existing value; do not block go-live on it.

---

## 3. Account / project consolidation (HIR-72)

The risk this ticket guards against: the OAuth client or consent screen was created under a
**personal or test Google account** instead of the canonical Hiro Google identity.
That makes ownership fragile and can create duplicate clients.

Do this once:

1. Confirm the OAuth client **and** consent screen in §1 live in the **single canonical Hiro GCP
   project**.
   The rest of the stack points at `hiro-500619` (the Play publisher service account is
   `eas-play-publisher@hiro-500619`), so that is the expected home — **founder to confirm**.
2. Make sure the canonical Hiro Google account is an **Owner** of that project.
3. If a **duplicate** OAuth client exists under a different account/project, delete it so there is
   exactly one client, and make sure the Client ID/secret in Supabase (§2a) belong to the surviving
   one.

> _Founder: confirm the canonical project/account here once verified:_ `__________________`

---

## 4. Post-go-live verification (do on a real device + a non-test account)

After §1–§3, verify with a Google account that is **not** on the old test-user allow-list:

- [ ] **Mobile (primary):** on an internal **preview**/TestFlight build, tap **Continue with
      Google**, complete consent.
- [ ] No *"access blocked / app not verified / app is being tested"* wall appears.
- [ ] The browser redirects back into the app via `hiro://auth/callback` and you land signed-in.
- [ ] Kill and relaunch the app — the session persists (no re-login).
- [ ] _(Optional, dev only)_ if running the web app locally, the same account signs in at
      `http://localhost:3000`.

If any step fails, recheck the two redirect values in §0 first — a mismatch there is the most
common cause.

---

## Appendix: code audit (done in HIR-72, no changes needed)

The redirect configuration in code was audited against the deployed targets and is correct:

| Surface | File | Value | Verdict |
|---|---|---|---|
| Mobile redirect | `apps/mobile/src/lib/authService.ts` | `hiro://auth/callback` | ✅ matches `app.json` `scheme: "hiro"` |
| Mobile flow type | `packages/supabase-clients/src/index.ts` | `flowType: "pkce"` | ✅ required for the native code exchange |
| Web OAuth redirect | `apps/web/src/lib/authService.ts` | `new URL("/auth/callback", window.location.origin)` | ✅ runtime-derived origin, nothing hardcoded |
| Web callback route | `apps/web/src/app/auth/callback/route.ts` | request `origin`, server-side code exchange | ✅ standard `@supabase/ssr` PKCE pattern |
| Web browser client | `apps/web/src/lib/supabase/client.ts` | `createBrowserClient` (`@supabase/ssr`) | ✅ PKCE by default |

The mobile path uses a fixed custom scheme and the web path derives its origin at runtime, so there
is no environment-specific redirect baked into the binary or bundle.
The only production gap is the dashboard config in §1–§3, which this runbook covers.
