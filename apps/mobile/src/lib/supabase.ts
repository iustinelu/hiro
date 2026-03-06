import * as SecureStore from "expo-secure-store";
import type { SupportedStorage } from "@supabase/supabase-js";
import { validateRuntimeEnv } from "@hiro/runtime";
import { createMobileClient } from "@hiro/supabase-clients";

const secureStorage: SupportedStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const env = validateRuntimeEnv({
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

export const supabase = createMobileClient(env, secureStorage);
