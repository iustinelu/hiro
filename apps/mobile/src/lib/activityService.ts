import { supabase } from "./supabase";

export async function logActivity(
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profileId } = await supabase.rpc("current_profile_id");
    if (!profileId) return;

    await supabase.from("activity_events").insert({
      profile_id: profileId,
      event_name: eventName,
      metadata: metadata ?? null
    });
  } catch {
    // Fire-and-forget: diagnostics must never break the app
  }
}
