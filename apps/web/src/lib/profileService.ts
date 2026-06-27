import { getSupabaseBrowserClient } from "./supabase/client";

export async function getDisplayName(
  profileId: string
): Promise<{ displayName: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", profileId)
    .single();
  if (error) return { displayName: null, error: error.message };
  return { displayName: data.display_name as string | null, error: null };
}

export async function updateDisplayName(
  profileId: string,
  name: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim() })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return { error: null };
}

// Mirrors the mobile profileService (kept 1:1 per the platform-parity contract)
// so the web interactive tour can be built on the same flag in a later wave.
export async function getOnboardingCompleted(
  profileId: string
): Promise<{ onboardingCompleted: boolean; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", profileId)
    .single();
  if (error) return { onboardingCompleted: true, error: error.message };
  return { onboardingCompleted: (data.onboarding_completed as boolean | null) ?? true, error: null };
}

export async function markOnboardingCompleted(
  profileId: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return { error: null };
}
