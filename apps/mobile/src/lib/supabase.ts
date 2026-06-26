import * as SecureStore from "expo-secure-store";
import type { SupabaseClient, SupportedStorage } from "@supabase/supabase-js";
import { validateRuntimeEnv } from "@hiro/runtime";
import { createMobileClient } from "@hiro/supabase-clients";

const secureStorage: SupportedStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Fail-soft init. validateRuntimeEnv() throws when EXPO_PUBLIC_* vars are missing
// (e.g. a release build that didn't bake them in). This module is imported at the top
// of the app entry, so a throw here happens BEFORE React mounts — the ErrorBoundary
// (render-only) cannot catch it and the app crashes instantly on launch.
//
// Instead we capture the error and expose it via `supabaseInitError`. The app entry
// gates on that and renders a visible config-error screen rather than dying silently.
// We still construct a (non-functional) client with placeholder values so `supabase`
// stays typed as SupabaseClient — every consumer keeps working, and none of them are
// reachable when supabaseInitError is set because the entry never renders the app tree.
let initError: Error | null = null;
let client: SupabaseClient;

try {
  const env = validateRuntimeEnv({
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
  client = createMobileClient(env, secureStorage);
} catch (error) {
  initError = error instanceof Error ? error : new Error(String(error));
  client = createMobileClient(
    {
      appEnv: "production",
      supabaseUrl: "https://placeholder.invalid",
      supabaseAnonKey: "placeholder",
    },
    secureStorage
  );
}

export const supabase = client;
export const supabaseInitError = initError;
