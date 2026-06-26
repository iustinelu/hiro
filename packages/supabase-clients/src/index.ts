import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, SupportedStorage } from "@supabase/supabase-js";
import type { RuntimeEnv } from "@hiro/runtime";

export function createWebClient(env: RuntimeEnv): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createMobileClient(
  env: RuntimeEnv,
  storage: SupportedStorage
): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // PKCE is required for the native Google OAuth flow: signInWithGoogle() opens the
      // Supabase auth URL in a browser and calls exchangeCodeForSession(code) on the
      // hiro://auth/callback redirect. The auth-js default is 'implicit', which returns
      // tokens in the URL fragment (no ?code=) and makes that exchange always fail.
      flowType: "pkce",
    },
  });
}
