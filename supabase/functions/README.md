# supabase/functions Ownership

Deno edge functions. Business logic that cannot live in SQL (here: calling Expo's
external push API) belongs here. SQL migrations remain the single source of truth
for schema and RLS — see `../README.md`.

## send-push

Drains `public.notification_outbox` and delivers each pending row via Expo's push
API. Runs with the service role (auto-injected `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY`), so it bypasses RLS to read tokens and update the outbox.

Behaviour:
- Claims `status = 'pending'` rows (oldest first, up to 500/run).
- Resolves recipient `device_tokens`, sends to Expo in chunks of 100.
- Marks rows `sent` (incl. recipients with no device — nothing to deliver) or
  `failed` (transient error; `attempts` incremented, retried next run).
- Prunes tokens that Expo reports as `DeviceNotRegistered`.

### Deploy
Via Supabase MCP `deploy_edge_function`, or CLI:
```
supabase functions deploy send-push --project-ref pfokfopwjrahclmseper --no-verify-jwt
```
`--no-verify-jwt` lets the Database Webhook / cron invoke it internally; it trusts
no client input and only acts on the service role.

### Trigger the drain (production)
Recommended: a **Database Webhook** on `notification_outbox` INSERT that POSTs to the
function with the service-role key as the `Authorization: Bearer` header (near
real-time). Optional safety net: a `pg_cron` job invoking it every minute. Both are
documented for the founder in `docs/v0.1.3/push-notifications-ops.md`.

### Manual test (acceptance demo)
```
supabase functions invoke send-push --project-ref pfokfopwjrahclmseper
```
Returns `{ processed, sent, failed, tokens_pruned }`.
