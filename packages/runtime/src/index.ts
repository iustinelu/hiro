export interface RuntimeEnv {
  appEnv: "development" | "staging" | "production";
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function validateRuntimeEnv(env: Record<string, string | undefined>): RuntimeEnv {
  const appEnv = env.APP_ENV;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!appEnv) throw new Error("Missing APP_ENV");
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
  if (!supabaseAnonKey) throw new Error("Missing SUPABASE_ANON_KEY");

  if (!["development", "staging", "production"].includes(appEnv)) {
    throw new Error("APP_ENV must be one of: development, staging, production");
  }

  return {
    appEnv: appEnv as RuntimeEnv["appEnv"],
    supabaseUrl,
    supabaseAnonKey
  };
}
