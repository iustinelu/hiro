# 09 - Push notifications (HIR-66)

**Ticket:** HIR-66  **Branch:** `hir-66/push-notifications`  **Worktree:** `../hiro-push-notifications`
**Platforms:** mobile + Supabase  **Size:** L  **Group:** 3
**Needs from founder:** APNs key (Apple) + FCM setup (Android). **Needs E-A harness** (dev build, not Expo Go).

## Goal
Real nudges so chores actually get done: push on key events (chore due/assigned, reward redeemed, contest/settle activity). Mobile-first; web push out of scope (per IA decision).

## CRITICAL build lesson
`expo-notifications` is a **native module**. It MUST be added to `apps/mobile/package.json` (NOT root) and the plugin added to `app.json`, or the standalone build crashes with "Cannot find native module" (this exact class of bug crashed 0.1.1). It also cannot run in Expo Go - QA on a dev build via the E-A harness.

## Do
1. Add `expo-notifications` to `apps/mobile/package.json`; add it to `app.json` `plugins`. Add any required keys/config to `eas.json` (document what the founder must supply: APNs key in Apple Developer, FCM server key/google-services for Android).
2. **Token registration:** request permission contextually (end of onboarding - coordinate with brief 07), get the Expo push token, store it in a **new device-tokens table** (one row per device per profile) with RLS via `current_profile_id()`. Denial test mandatory.
3. **Delivery:** a Supabase **edge function** that sends pushes via Expo's push API on the chosen events (start with: chore assigned/due + contest/settle activity). Trigger via DB triggers/RPC or scheduled function - decide and document.
4. Handle permission-denied gracefully (no crashes, clear settings path in More).

## Acceptance
- App registers a push token on a real (emulator/dev) build and stores it with correct RLS.
- A test event produces a delivered notification (document how you tested - Expo push tool is fine for the demo).
- No native-module crash; founder steps for APNs/FCM documented.

## Founder QA Quick Cycle
- **Commands:** `npm run check` (green); mobile dev build via E-A harness; (founder supplies APNs/FCM first).
- **Route:** launch app -> grant notification permission (post-onboarding) -> trigger a qualifying event -> observe the push.
- **Look for:** token registered, notification received, permission-denied handled.
- **Pass/fail:** Pass = token stored + notification delivered + no crash. Fail = no token, no delivery, or native crash.
