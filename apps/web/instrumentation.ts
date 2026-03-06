import { validateRuntimeEnv } from "@hiro/runtime";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    validateRuntimeEnv({
      APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
}
