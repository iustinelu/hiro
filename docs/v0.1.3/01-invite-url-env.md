# 01 - Invites must work without a web app (mobile-only redesign)

**Ticket:** (blocker) - "Mobile-only invite flow (no web landing page)"
**Branch:** `feat/mobile-only-invites`  **Worktree:** `../hiro-mobile-invites`
**Platforms:** mobile + Supabase  **Size:** M  **Group:** 1
**SUPERSEDES** the earlier "env the web origin" version - we dropped web/Vercel (see memory `project_mobile_first_focus`), so there is **no hosted page** for `/invite/[token]` to open.

## Problem
`apps/mobile/src/screens/MoreScreen.tsx:15` builds invite links against `http://localhost:3000`, and the accept flow assumes the web app hosts `/invite/[token]`. With no web deploy, those links go nowhere. We need invites that work with **only the mobile app**.

## Recommended approach (confirm with founder before building)
**Join-code in-app:** surface the existing invite token as a short, shareable **join code**, and add an "Enter a code to join a household" path inside the app.
- Sharer: More -> create invite -> native Share sheet shares a message with (a) the join code and (b) a store/download link (placeholder until store URLs exist).
- Invitee: installs Hiro, signs up, and enters the code in onboarding (ties into brief 07 "Join a household" path) or in More.
- Reuse the existing invite token + `accept_invite` RPC; just expose/accept it as a code instead of a URL. No web needed.
- (If the founder prefers real tappable links later, that needs universal/app links + a tiny static landing host - out of scope for now.)

## Do
1. Remove the hardcoded `WEB_ORIGIN`/localhost from `MoreScreen.tsx` and any web-page assumption in `apps/mobile/src/lib/inviteService.ts`.
2. Build the share-a-code flow + the enter-a-code-to-join flow in the app (mobile). Reuse `accept_invite` (and the join-while-in-a-household guard - see the data-loss confirmation note in `ia-decision.md`).
3. Keep the share message friendly; leave a clearly-marked TODO for the store download URL.
4. Web: no work (parked).

## Acceptance
- A real friend can join a household using only the mobile app (share code -> install -> enter code -> joined). No dependency on any web page.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); mobile via E-A emulator harness.
- **Route:** Account A: More -> create invite -> Share (note the code). Account B (fresh): sign up -> enter code -> joins A's household.
- **Look for:** no localhost/web link anywhere; code-based join works; join-while-in-household shows the data-loss confirmation.
- **Pass/fail:** Pass = code-based join works app-only on the emulator. Fail = relies on a web page, or join fails.
