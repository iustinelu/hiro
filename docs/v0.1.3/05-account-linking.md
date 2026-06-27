# 05 - Account-linking UX when sign-in method differs (HIR-71)

**Ticket:** HIR-71  **Branch:** `hir-71/account-linking`  **Worktree:** `../hiro-account-linking`
**Platforms:** web + mobile  **Size:** M  **Group:** 2 (**run before 06** - shared auth files)

## Problem
When someone created their account with one method (e.g. email+password) and later tries the other (e.g. Google) on the same email - or vice versa - they hit a dead-end "sign-in failed." Real friends will absolutely do this. We should recognize the existing account and guide them to the right method (or link).

## Investigate first
- Read `apps/web/src/lib/authService.ts` + `apps/mobile/src/lib/authService.ts` and the sign-in/sign-up screens (`apps/web/src/app/auth/*`, `apps/mobile/src/screens/auth/*`).
- Understand what Supabase returns in each collision case (existing email signing up; OAuth for an email that exists as password; password attempt for an OAuth-only account). Note Supabase's identity-linking constraints.

## Do
- Detect the "account already exists with a different method" case and replace the generic failure with a clear, friendly path: tell the user which method their account uses and let them continue with it (e.g. "This email is registered with Google - continue with Google"). Where Supabase supports identity linking for an authenticated session, offer to link; otherwise guide to the correct existing method.
- Keep web + mobile parity (same logic, platform-appropriate UI).
- Respect theming; friendly copy, no raw error codes shown to users.

## Acceptance
- No dead-end "sign-in failed" for the cross-method case; user is routed to a working path.
- Both new-signup-collision and existing-account-wrong-method covered.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); `npm run dev:web` (+ mobile via E-A harness).
- **Route:** create an account with email+password, sign out, then "Continue with Google" using the same email (and the reverse).
- **Look for:** a clear message + a working route to sign in, not a generic failure.
- **Pass/fail:** Pass = guided to correct/linked method on both platforms. Fail = dead-end error or duplicate/locked account.
