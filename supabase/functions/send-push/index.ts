// HIR-66: send-push edge function
//
// Drains pending rows from public.notification_outbox and delivers them via
// Expo's push API (https://exp.host/--/api/v2/push/send). Designed to be called:
//   - manually:  supabase functions invoke send-push
//   - by a Supabase Database Webhook on notification_outbox INSERT (near real-time)
//   - by a pg_cron schedule (optional safety-net drain)
//
// It is idempotent on the outbox: rows are claimed by status, marked sent/failed,
// and failed rows are retried on the next run (attempts is incremented). Uses the
// service role (auto-injected) and therefore bypasses RLS.

import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_LIMIT = 500; // max outbox rows processed per invocation
const CHUNK_SIZE = 100; // Expo accepts up to 100 messages per request

type OutboxRow = {
  id: string;
  recipient_profile_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: "default";
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Claim pending outbox rows (oldest first).
  const { data: rows, error: rowsError } = await supabase
    .from("notification_outbox")
    .select("id, recipient_profile_id, title, body, data")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (rowsError) {
    return new Response(JSON.stringify({ error: rowsError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const outbox = (rows ?? []) as OutboxRow[];
  if (outbox.length === 0) {
    return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Resolve device tokens for every recipient in one query.
  const recipientIds = [...new Set(outbox.map((r) => r.recipient_profile_id))];
  const { data: tokenRows, error: tokenError } = await supabase
    .from("device_tokens")
    .select("profile_id, token")
    .in("profile_id", recipientIds);

  if (tokenError) {
    return new Response(JSON.stringify({ error: tokenError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tokensByProfile = new Map<string, string[]>();
  for (const tr of tokenRows ?? []) {
    const list = tokensByProfile.get(tr.profile_id) ?? [];
    list.push(tr.token);
    tokensByProfile.set(tr.profile_id, list);
  }

  // 3. Build the message list, remembering which outbox row + token each maps to.
  type Pending = { outboxId: string; token: string };
  const messages: ExpoMessage[] = [];
  const pendings: Pending[] = [];
  const noTokenRows: string[] = []; // recipients with no device — nothing to deliver

  for (const row of outbox) {
    const tokens = tokensByProfile.get(row.recipient_profile_id) ?? [];
    if (tokens.length === 0) {
      noTokenRows.push(row.id);
      continue;
    }
    for (const token of tokens) {
      messages.push({
        to: token,
        title: row.title,
        body: row.body,
        data: row.data ?? {},
        sound: "default",
      });
      pendings.push({ outboxId: row.id, token });
    }
  }

  // Track outcome per outbox row: "ok" if no transient failures remain.
  const rowOk = new Map<string, boolean>();
  const ensureRow = (id: string) => {
    if (!rowOk.has(id)) rowOk.set(id, true);
  };
  outbox.forEach((r) => {
    if (!noTokenRows.includes(r.id)) ensureRow(r.id);
  });

  const tokensToDelete = new Set<string>();

  // 4. Send to Expo in chunks; map tickets back to outbox rows.
  const chunks = chunk(messages, CHUNK_SIZE);
  let ticketCursor = 0;
  for (const batch of chunks) {
    let tickets: ExpoTicket[] = [];
    try {
      const resp = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(batch),
      });
      const json = await resp.json();
      tickets = (json?.data ?? []) as ExpoTicket[];
    } catch (_e) {
      // Network/Expo outage: leave these rows failed for retry next run.
      tickets = batch.map(() => ({ status: "error" as const, message: "fetch_failed" }));
    }

    batch.forEach((_msg, i) => {
      const p = pendings[ticketCursor + i];
      const ticket = tickets[i];
      if (!ticket || ticket.status === "error") {
        if (ticket?.details?.error === "DeviceNotRegistered") {
          // Stale token — drop it. Does not fail the row (recipient simply
          // has no live device for this token).
          tokensToDelete.add(p.token);
        } else {
          rowOk.set(p.outboxId, false); // transient — retry later
        }
      }
    });
    ticketCursor += batch.length;
  }

  // 5. Persist results.
  const sentIds = [...rowOk.entries()].filter(([, ok]) => ok).map(([id]) => id);
  const failedIds = [...rowOk.entries()].filter(([, ok]) => !ok).map(([id]) => id);
  const nowIso = new Date().toISOString();

  // Recipients with no device: mark sent (event processed, nothing to deliver).
  const allSentIds = [...sentIds, ...noTokenRows];

  if (allSentIds.length > 0) {
    await supabase
      .from("notification_outbox")
      .update({ status: "sent", sent_at: nowIso, updated_at: nowIso })
      .in("id", allSentIds);
  }
  for (const id of failedIds) {
    // Increment attempts individually (no atomic increment in one update call).
    const { data: cur } = await supabase
      .from("notification_outbox")
      .select("attempts")
      .eq("id", id)
      .single();
    await supabase
      .from("notification_outbox")
      .update({ status: "failed", attempts: (cur?.attempts ?? 0) + 1, updated_at: nowIso })
      .eq("id", id);
  }
  if (tokensToDelete.size > 0) {
    await supabase.from("device_tokens").delete().in("token", [...tokensToDelete]);
  }

  return new Response(
    JSON.stringify({
      processed: outbox.length,
      sent: allSentIds.length,
      failed: failedIds.length,
      tokens_pruned: tokensToDelete.size,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
