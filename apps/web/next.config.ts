import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@hiro/domain",
    "@hiro/runtime",
    "@hiro/supabase-clients",
    "@hiro/ui-tokens",
    "@hiro/ui-primitives"
  ]
};

export default nextConfig;
