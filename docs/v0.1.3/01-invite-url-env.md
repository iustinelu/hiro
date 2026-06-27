# 01 - Mobile invite URL must be env-driven (config blocker)

**Ticket:** (config blocker, no Linear #) - file one if you like: "Mobile invite links hardcoded to localhost"
**Branch:** `chore/mobile-invite-url-env`  **Worktree:** `../hiro-invite-url-env`
**Platforms:** mobile (+ web audit)  **Size:** S  **Group:** 1 (parallel-safe)

## Problem
`apps/mobile/src/screens/MoreScreen.tsx:15` hardcodes:
```ts
const WEB_ORIGIN = "http://localhost:3000";
```
Invite links generated on mobile point at `localhost:3000`, so a real invited friend gets a dead link. This blocks the core "invite someone to your household" flow in production.

## Do
1. Replace the constant with an env-driven origin: read `process.env.EXPO_PUBLIC_WEB_ORIGIN` with a dev fallback (`http://localhost:3000`). Mobile env typing lives in `apps/mobile/src/types/env.d.ts` - add the new var there.
2. Add `EXPO_PUBLIC_WEB_ORIGIN` to `apps/mobile/eas.json` for **both** the `preview` and `production` build profiles. Use the production web origin once the founder confirms it (leave a clearly-marked TODO + the agreed value; default to the Vercel URL if known).
3. Add it to the local `apps/mobile/.env` so dev still works.
4. **Audit the web side** for any equivalent hardcoded origin in invite generation (`apps/web/src/lib/inviteService.ts`, the More page, `apps/web/src/app/invite/[token]/`). Web should use a relative path or `window.location.origin`; fix if it hardcodes anything.

## Acceptance
- No hardcoded `localhost` origin remains in invite-link generation on either platform.
- Mobile reads the origin from env; `eas.json` carries it for preview + production.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); `npm run dev:mobile` (with `.env` containing `EXPO_PUBLIC_WEB_ORIGIN`).
- **Route:** Mobile -> More -> create an invite -> open the native Share sheet.
- **Look for:** the invite URL uses the configured web origin, not `localhost:3000`.
- **Pass/fail:** Pass = link points at the real web origin and opens the invite accept page. Fail = still localhost, or env not read.
