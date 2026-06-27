import type { AuthMethod } from "@hiro/domain";
import { getSupabaseBrowserClient } from "./supabase/client";

// HIR-71: which sign-in method(s) an email is registered with (via SECURITY DEFINER RPC),
// so the UI can guide a user to the right method instead of a generic failure.
// Returns null when the lookup itself fails (network/RPC error) so callers can fall back to a
// safe generic message instead of mistaking an outage for "no account exists".
export async function getAccountMethods(email: string): Promise<AuthMethod[] | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("account_methods_for_email", { p_email: email });
  if (error) return null;
  return (data as AuthMethod[] | null) ?? [];
}

// The signed-in user's own methods (used to gate the "Set a password" affordance).
// Returns null on lookup failure (the affordance then stays hidden).
export async function getMyAccountMethods(): Promise<AuthMethod[] | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("current_account_methods");
  if (error) return null;
  return (data as AuthMethod[] | null) ?? [];
}

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
  password: string,
  displayName: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
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

export async function signInWithGoogle(next?: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (next) callbackUrl.searchParams.set("next", next);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });
  return { error: error?.message ?? null };
}
