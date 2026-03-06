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
    },
  });
}
