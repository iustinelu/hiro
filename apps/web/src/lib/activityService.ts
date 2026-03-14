import type { SupabaseClient } from "@supabase/supabase-js";

export async function logActivity(
  client: SupabaseClient,
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: user } = await client.auth.getUser();
    if (!user.user) return;

    const { data: profileId } = await client.rpc("current_profile_id");
    if (!profileId) return;

    await client.from("activity_events").insert({
      profile_id: profileId,
      event_name: eventName,
      metadata: metadata ?? null
    });
  } catch {
    // Fire-and-forget: diagnostics must never break the app
  }
}
