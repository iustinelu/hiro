# 11 - In-app account deletion path (store requirement)

**Ticket:** (store-compliance, file a Linear #) - "In-app account deletion"
**Branch:** `feat/account-deletion`  **Worktree:** `../hiro-account-deletion`
**Platforms:** web + mobile + Supabase  **Size:** M  **Group:** 4
**Why now:** Apple App Store AND Google Play **require** an in-app way to delete your account + data. Flagged open in `docs/launch/app-store-listing.md`. Without it, store review can reject us.

## Do
1. **Backend:** a Supabase RPC (SECURITY DEFINER) that deletes/anonymizes the authenticated user's data with correct cascade across households/tasks/completions/expenses/rewards/redemptions/invites/profiles, plus the auth user. Handle the **owner-leaves-household** edge (ownership transfer or household teardown) - reuse the logic already in `accept_invite_and_leave` / `20260412120000`. Decide hard-delete vs anonymize and justify (GDPR-friendly).
2. **RLS / safety:** a user can only delete **their own** account. Denial test mandatory. Make it irreversible-by-design but guard with a strong confirmation.
3. **UI:** "Delete account" in the More tab (web + mobile), with a scary, explicit confirmation describing what's lost (especially if they're the household owner). Keep parity + theming.
4. After deletion: sign the user out and return to the signed-out state cleanly.

## Acceptance
- A user can delete their account from inside the app on both platforms; their data is removed/anonymized; no orphaned households.
- Only the owner of the account can trigger it; denial test green.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green, incl. migrations); `npm run dev:web` (+ mobile via E-A harness).
- **Route:** create a throwaway account (as household owner + as a plain member) -> More -> Delete account -> confirm.
- **Look for:** clear warning, data actually gone (verify via SQL), clean sign-out, household not orphaned.
- **Pass/fail:** Pass = deletion works on both platforms + cascade correct + denial test green. Fail = data remains, orphaned household, or any other user's data affected.
