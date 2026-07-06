import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import type { AuthMethod } from "@hiro/domain";
import { supabase } from "./supabase";

// HIR-71: which sign-in method(s) an email is registered with (via SECURITY DEFINER RPC),
// so the UI can guide a user to the right method instead of a generic failure.
// Returns null when the lookup itself fails (network/RPC error) so callers can fall back to a
// safe generic message instead of mistaking an outage for "no account exists".
export async function getAccountMethods(email: string): Promise<AuthMethod[] | null> {
  const { data, error } = await supabase.rpc("account_methods_for_email", { p_email: email });
  if (error) return null;
  return (data as AuthMethod[] | null) ?? [];
}

// The signed-in user's own methods (used to gate the "Set a password" affordance).
// Returns null on lookup failure (the affordance then stays hidden).
export async function getMyAccountMethods(): Promise<AuthMethod[] | null> {
  const { data, error } = await supabase.rpc("current_account_methods");
  if (error) return null;
  return (data as AuthMethod[] | null) ?? [];
}

// The signed-in user's email (for display in account settings).
export async function getMyEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

// The current auth session (null when signed out). Used to gate the root navigator.
export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Subscribe to auth-state changes. Returns an unsubscribe function. */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => listener.subscription.unsubscribe();
}

export async function updatePassword(
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function sendPasswordResetEmail(
  email: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error: error?.message ?? null };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectTo = "hiro://auth/callback";

  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (oauthError || !data.url) {
    return { error: oauthError?.message ?? "Could not start Google sign-in." };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    return { error: null }; // User cancelled — not an error
  }

  const url = new URL(result.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return { error: "Sign-in failed. Please try again." };
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  return { error: sessionError?.message ?? null };
}
