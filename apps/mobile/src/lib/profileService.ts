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
