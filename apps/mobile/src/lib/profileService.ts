import { supabase } from "./supabase";

export async function getDisplayName(
  profileId: string
): Promise<{ displayName: string | null; error: string | null }> {
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
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim() })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getTheme(
  profileId: string
): Promise<{ theme: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("theme")
    .eq("id", profileId)
    .single();
  if (error) return { theme: null, error: error.message };
  return { theme: data.theme as string | null, error: null };
}

export async function updateTheme(
  profileId: string,
  theme: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ theme })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getOnboardingCompleted(
  profileId: string
): Promise<{ onboardingCompleted: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", profileId)
    .single();
  if (error) return { onboardingCompleted: true, error: error.message };
  // Default to "completed" on a missing/null value so we never nag a user we
  // can't read a flag for.
  return { onboardingCompleted: (data.onboarding_completed as boolean | null) ?? true, error: null };
}

export async function markOnboardingCompleted(
  profileId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", profileId);
  if (error) return { error: error.message };
  return { error: null };
}
