# Hiro branded email templates (HIR-63)

Source-of-truth HTML templates for Hiro's Supabase Auth transactional emails.
These are pasted into the Supabase dashboard by the founder - see the go-live runbook at
[`../email-go-live.md`](../email-go-live.md) for the exact wiring steps.

## Files

| File | Maps to Supabase template | Status |
|------|---------------------------|--------|
| `confirm-signup.html` | Authentication → Email Templates → **Confirm signup** | **Active** - sent on every signup. |
| `reset-password.html` | Authentication → Email Templates → **Reset password** | **Active** - sent on password-reset request. |
| `invite.html` | Authentication → Email Templates → **Invite user** | **Installed but not sent today** (see below). |
| `*.txt` | - | Plain-text reference copies. Not pasted (Supabase template fields are HTML-only). |

### About the invite template

Hiro does **not** currently send invite emails. Household invites are token-links: the app
generates a token (`create_invite` RPC) and the user shares the resulting
`<web-origin>/invite/<token>` link via the OS share sheet / clipboard
(`apps/mobile/src/screens/MoreScreen.tsx`, `apps/web/src/app/(tabs)/more/page.tsx`).
The `household_invites.invited_email` column is metadata only - it is never emailed.

Supabase's "Invite user" template only fires via the admin invite API
(`supabase.auth.admin.inviteUserByEmail`), which Hiro does not call. `invite.html` is shipped
here so the template is on-brand if/when admin-invites are ever introduced. Correctness of the
**token-link** origin is handled separately by brief `01-invite-url-env.md`.

## Design system (shared shell)

All three templates use the same bulletproof structure:

- Table-based layout, 600px max width, centered, all CSS inline. No external CSS/JS/webfonts.
- **Full dark aurora** palette (matches the in-app aurora theme):

  | Role | Hex |
  |------|-----|
  | Page background | `#15121f` |
  | Card surface | `#211c30` |
  | Card border / divider | `#302844` |
  | Heading / wordmark ink | `#f7f3ff` |
  | Body copy | `#a99fc6` |
  | Footer / muted | `#6e678c` |
  | Primary CTA (orange) | `#ff7a59` on `#1a1206` text |
  | Link / accent (teal) | `#57e0c0` |

- **Brand survives image-blocking:** a CSS "Hiro" wordmark always renders; the hosted icon PNG
  sits above it. Mail clients block images by default, so the brand still reads with images off.
- **Bulletproof CTA:** orange button with a VML fallback for Outlook, plus a copy-paste link
  line below it.
- Hidden preheader text per email; web-safe Inter-first font stack.

## Supabase template variables

Supabase (GoTrue) injects these Go-template variables when sending. Keep them intact:

| Template | Variables used | Notes |
|----------|----------------|-------|
| `confirm-signup.html` | `{{ .ConfirmationURL }}` | Primary CTA + fallback link. |
| `reset-password.html` | `{{ .ConfirmationURL }}` | Primary CTA + fallback link. |
| `invite.html` | `{{ .ConfirmationURL }}` | Primary CTA + fallback link. `{{ .SiteURL }}` available if needed. |

Other variables Supabase exposes if you want them: `{{ .Email }}`, `{{ .SiteURL }}`,
`{{ .Token }}`, `{{ .TokenHash }}`, `{{ .RedirectTo }}`.

## Placeholders to replace before going live

| Token | Replace with | Where |
|-------|--------------|-------|
| `__LOGO_URL__` | Absolute `https://` URL of the hosted 48px+ Hiro icon PNG. | All three `.html` files (one `<img src>` each). |
| `__WEB_ORIGIN__` | Production web/app origin. | Reserved for any literal link; auth links come from `{{ .ConfirmationURL }}`, so this is usually not needed. |

Because Hiro is **mobile-only with no web deploy**, the recommended host for the logo PNG is a
**public Supabase Storage bucket** - exact steps in the runbook. Source asset:
`apps/web/public/icon-192.png`.

## Editing rule

These `.html` files are the **source of truth**. If you change an email, edit the file here
first, then re-paste into the Supabase dashboard. Never hand-edit only in the dashboard.
