import type { RuntimeEnv } from "@hiro/runtime";

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
  context: "web-server" | "web-client" | "mobile-client";
}

export function createWebServerClient(env: RuntimeEnv): SupabaseClientConfig {
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey, context: "web-server" };
}

export function createWebClient(env: RuntimeEnv): SupabaseClientConfig {
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey, context: "web-client" };
}

export function createMobileClient(env: RuntimeEnv): SupabaseClientConfig {
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey, context: "mobile-client" };
}
