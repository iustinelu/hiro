import { getSupabaseBrowserClient } from "./supabase/client";

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error?.message ?? null };
}

export async function updatePassword(
  password: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}
