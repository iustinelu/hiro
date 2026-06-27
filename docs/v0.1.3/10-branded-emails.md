# 10 - Branded transactional emails + Resend (HIR-63)

**Ticket:** HIR-63  **Branch:** `hir-63/branded-emails`  **Worktree:** `../hiro-branded-emails`
**Platforms:** Supabase Auth config + email templates  **Size:** M  **Group:** 3
**Needs from founder:** Resend account + API key + verified sending domain.

## Why
Two problems with the default Supabase auth emails: they're unbranded/ugly, and Supabase's **free-tier email rate limit will block real signups at volume**. Wiring Resend as the SMTP provider fixes both.

## Do
1. **Templates:** design branded HTML email templates for confirm-signup, reset-password, and invite. On-brand (Hiro mark, the aurora palette), responsive, plain-text fallback. Keep them in the repo (e.g. `docs/v0.1.3/email-templates/` or a dedicated `emails/` dir) as the source of truth.
2. **Resend SMTP:** document the exact Supabase Auth settings to point custom SMTP at Resend (host/port/user/pass from the founder's Resend key), and how to paste the templates into Supabase Auth -> Email Templates. Write this as `docs/v0.1.3/email-go-live.md`.
3. **Invite email alignment:** we dropped web/Vercel (mobile-only), so invite emails must NOT link to a web page. Include the join **code** + a store/download link instead (align with brief 01's code-based invite flow). Confirm/reset emails are auth-flow emails and are fine as-is.
4. Note any template variables Supabase requires (`{{ .ConfirmationURL }}` etc.) so they render correctly.

## Acceptance
- Three branded templates exist in-repo; a clear founder runbook to wire Resend SMTP + install templates.
- Invite links in email use the production web origin.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green).
- **Route:** after founder applies `email-go-live.md`: trigger a signup confirm, a password reset, and an invite; check the received emails.
- **Look for:** branded, correct links (prod origin), delivered via Resend (not Supabase default), renders on mobile mail clients.
- **Pass/fail:** Pass = branded + correct links + Resend delivery. Fail = default template, localhost links, or rate-limited.
