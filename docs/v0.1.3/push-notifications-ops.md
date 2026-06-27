# Push notifications — founder/ops setup (HIR-66)

The code (token registration, outbox, triggers, `send-push` edge function) ships in
the PR. The steps below are the platform/ops wiring only **the founder** can do
because they need Apple/Google/Supabase dashboard access. Until they're done, push
delivery works in dev against a token (Expo push tool / manual function invoke) but
not as standalone-build production delivery.

## 1. Apple — APNs key (iOS)

1. Apple Developer → Certificates, Identifiers & Profiles → **Keys** → **+**.
2. Enable **Apple Push Notifications service (APNs)**, create, download the `.p8`.
3. Give it to EAS so standalone/TestFlight builds can deliver:
   ```
   eas credentials        # iOS → Push Notifications → set up APNs key
   ```
   (EAS can also auto-manage this during `eas build` for iOS.)
4. No app-side change needed — the bundle id `com.behiro.app` already exists.

## 2. Google — FCM (Android)

1. Firebase console → create/select a project → add an **Android app** with package
   `com.behiro.app`.
2. Project settings → **Cloud Messaging** → ensure the **FCM V1 API** is enabled.
3. Generate a service-account JSON (Project settings → Service accounts → Generate
   new private key) and upload it to EAS:
   ```
   eas credentials        # Android → Google Service Account → FCM V1
   ```
4. Expo uses FCM to deliver Android pushes sent through the Expo push API.

> No `google-services.json` is committed; EAS manages the credential.

## 3. Deploy the edge function

```
supabase functions deploy send-push --project-ref pfokfopwjrahclmseper --no-verify-jwt
```
`--no-verify-jwt` lets the Database Webhook / cron call it internally; the function
trusts no client input and acts only with the service role.

## 4. Trigger the drain

The triggers enqueue into `notification_outbox`; something must run `send-push` to
deliver. Pick one (webhook recommended):

**A. Database Webhook (near real-time, recommended).** Supabase Dashboard → Database
→ Webhooks → Create:
- Table: `public.notification_outbox`, Events: **Insert**.
- Type: Supabase Edge Function → `send-push`.
- Add header `Authorization: Bearer <SERVICE_ROLE_KEY>`.

**B. pg_cron safety net (optional).** A minute-ly job that invokes the function via
`pg_net`, draining anything a webhook missed. Document the service-role secret in
Vault rather than inlining it.

## 5. Verify end-to-end (acceptance)

On a dev build via the E-A harness (not Expo Go):
1. Sign in → finish onboarding → grant the notification prompt.
2. Confirm a row in `device_tokens` scoped to your profile.
3. From a second account in the same household, complete a chore (or redeem a
   reward). A `notification_outbox` row is enqueued for you.
4. The webhook (or `supabase functions invoke send-push`) delivers it — you get the
   push. The Expo push tool (https://expo.dev/notifications) against the stored token
   is a fine standalone demo.
5. Permission-denied: deny the OS prompt → no crash → **More → Notifications** shows
   "Blocked" with **Open settings**.

## Scope notes

Wired now: **task completion** and **reward redemption** nudges to other household
members. Deferred until the underlying features exist (each is a one-trigger add):
chore *assigned* (no assignment model), chore *due* (no due-date model), *contest*
(no contest feature), expense/*settle*.
