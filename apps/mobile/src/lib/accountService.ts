import { supabase } from "./supabase";

/**
 * Permanently delete the signed-in user's account via the `delete_account`
 * RPC: tears down or transfers ownership of their household(s), erases their
 * personal data, and deletes the auth user — all in one transaction.
 *
 * The caller is responsible for signing out afterwards (the server-side
 * session is invalid once the auth user is gone).
 */
export async function deleteAccount(): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("delete_account");
  if (error) {
    if (error.message.includes("NOT_AUTHENTICATED")) {
      return { error: "You're not signed in." };
    }
    return { error: error.message };
  }
  return { error: null };
}
