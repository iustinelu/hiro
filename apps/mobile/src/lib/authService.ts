import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

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
