# Email go-live runbook - Resend SMTP + branded templates (HIR-63)

**Audience:** founder. **Outcome:** Hiro's auth emails (signup confirmation, password reset) are
branded, delivered through **Resend** instead of Supabase's built-in mailer, and no longer subject
to Supabase's free-tier email rate limit.

This is a one-time configuration applied in the Resend and Supabase dashboards. No app deploy is
required. The branded templates live in [`email-templates/`](email-templates/) - that folder is the
source of truth; this runbook installs them.

> **Why this matters:** Supabase's default mailer is rate-limited (it will start dropping real
> signup/reset emails at volume) and sends generic, unbranded mail. Pointing Auth at Resend via
> custom SMTP fixes both.

---

## Prerequisites (founder-owned)

- A **Resend** account: https://resend.com
- A **sending domain** you control (e.g. `hiro.app`) to verify in Resend. (Resend's shared
  `onboarding@resend.dev` sender works for a quick test but is not for production.)
- Access to the **Supabase** project dashboard (`pfokfopwjrahclmseper`).

---

## Step 1 - Set up Resend

1. Sign up / log in at https://resend.com.
2. **Domains → Add Domain** → enter your sending domain.
3. Resend shows DNS records (SPF/`MX` for the bounce subdomain + **DKIM** `TXT` records, and an
   optional DMARC record). Add them at your DNS provider. Click **Verify** until the domain shows
   **Verified** (DNS can take minutes to hours).
4. **API Keys → Create API Key** (sending permission). Copy it once - you won't see it again. This
   key doubles as the SMTP password in Step 3.

---

## Step 2 - Host the logo image

Email clients need an absolute `https://` URL for images, and **Hiro is mobile-only (no web
deploy)**, so host the logo on a public Supabase Storage bucket:

1. Supabase dashboard → **Storage → New bucket** → name `public-assets`, mark it **Public**.
2. Upload `apps/web/public/icon-192.png` (the Hiro app icon) into the bucket.
3. Click the file → **Copy URL**. It looks like:
   `https://pfokfopwjrahclmseper.supabase.co/storage/v1/object/public/public-assets/icon-192.png`
4. In each of the three `email-templates/*.html` files, replace **`__LOGO_URL__`** with that URL.
   (One `<img src="__LOGO_URL__">` per file.)

> Alternative: host the PNG on any CDN/static host you control and use that URL instead. The only
> requirement is a stable, public `https` image URL.

---

## Step 3 - Point Supabase Auth at Resend (custom SMTP)

Supabase dashboard → **Authentication → Emails → SMTP Settings** (Project Settings → Auth in some
dashboard versions) → **Enable Custom SMTP**, then fill in:

| Field | Value |
|-------|-------|
| Host | `smtp.resend.com` |
| Port | `465` (SSL) - or `587` for STARTTLS |
| Username | `resend` |
| Password | *your Resend API key from Step 1.4* |
| Sender email | an address on your **verified** domain, e.g. `no-reply@hiro.app` |
| Sender name | `Hiro` |

Save. (Optional: review **Rate Limits** on the same Auth screen - with custom SMTP you can raise
the per-hour email cap above the constrained built-in default.)

---

## Step 4 - Install the branded templates

Supabase dashboard → **Authentication → Email Templates**. For each template below, switch the
editor to **HTML / source** mode, paste the full file contents, and set the subject:

| Supabase template | Paste file | Suggested subject |
|-------------------|-----------|-------------------|
| **Confirm signup** | `email-templates/confirm-signup.html` | `Confirm your Hiro email` |
| **Reset password** | `email-templates/reset-password.html` | `Reset your Hiro password` |
| **Invite user** | `email-templates/invite.html` | `You're invited to Hiro` |

Notes:
- Make sure you pasted the version **with `__LOGO_URL__` already replaced** (Step 2.4).
- Keep the `{{ .ConfirmationURL }}` variables intact - Supabase fills them per-send.
- Supabase template fields are **HTML-only**; there is no separate plain-text box. The `.txt` files
  are reference copies, not pasted.

---

## Step 5 - Site URL and Redirect URLs

So the `{{ .ConfirmationURL }}` links in the emails resolve to a live destination:

Supabase → **Authentication → URL Configuration**:
- **Site URL:** the canonical destination for auth links.
- **Redirect URLs (allow-list):** include every callback the app uses.

**Mobile-only consideration (decide before go-live):** Hiro ships as a native app with no web
deploy, so the auth-link destination is a real decision:
- The mobile deep link `hiro://auth/callback` is already in the project's redirect allow-list (used
  by Google OAuth). Email confirmation/reset links can be configured to land there, but tapping an
  `https` Supabase verification link from a mail client typically opens a browser first, then needs
  to hand off to the app.
- If you want a smooth browser→app hand-off (or a minimal hosted landing page for these links),
  that's a small follow-up to scope. Track it alongside brief `01-invite-url-env.md`, which already
  covers making the **invite token-link** origin env-driven rather than `localhost`.

This template/SMTP work does not block on that decision - the emails will be branded and delivered
via Resend regardless; only the post-tap landing depends on it.

---

## Step 6 - Invite emails (reality check)

Hiro does **not** auto-send invite emails today. Invites are token-links shared via the OS share
sheet. The Invite template is installed for completeness / future admin-invite use only. No action
needed beyond pasting it.

---

## Step 7 - Verify (founder QA)

1. **Signup confirm:** create a new account in the app with a real address you can check. Confirm
   you receive the branded **Confirm your Hiro email**.
2. **Password reset:** use "forgot password" with that address. Confirm the branded reset email.
3. For each received email, check:
   - **Branded:** dark aurora card, Hiro logo/wordmark, orange CTA button.
   - **Links work:** the CTA and the copy-paste fallback link both open the right flow.
   - **Delivered via Resend:** it appears in the **Resend dashboard → Emails** log, and the message
     headers show Resend's infrastructure (not Supabase's default `*.supabase.*` mailer).
   - **Renders on mobile:** open it in a phone mail client (Gmail/Apple Mail); layout holds, text is
     legible, no broken image frame when images are blocked.
4. **Rate limit gone:** signups/resets no longer hit Supabase's built-in email cap.

**Pass:** branded + correct links + Resend delivery + no rate-limit.
**Fail:** default/unbranded template, broken or `localhost` links, or still rate-limited via
Supabase's mailer.

---

## Rollback

To revert: Supabase → Authentication → SMTP Settings → **disable Custom SMTP** (falls back to the
built-in mailer and default templates). Templates can be reset individually with each editor's
**Reset to default** action.
