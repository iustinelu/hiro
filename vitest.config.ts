import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests live next to the pure-logic modules they cover: packages/* for
// platform-agnostic logic, and apps/mobile/src/lib/* for the service layer
// (Supabase access is mocked — see apps/mobile/src/lib/__tests__/supabaseMock.ts).
// Screens/components stay out: RN render code is exercised via founder QA + the
// guard scripts, not Vitest. Keep this fast so it runs on every `npm run check`.
const pkg = (relative: string) => fileURLToPath(new URL(`./packages/${relative}`, import.meta.url));

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/mobile/src/lib/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    // Resolve @hiro/* workspace imports to their TS source so mobile services can
    // be tested without a build step.
    alias: {
      "@hiro/domain": pkg("domain/src/index.ts"),
      "@hiro/runtime": pkg("runtime/src/index.ts"),
      "@hiro/ui-tokens": pkg("ui-tokens/src/index.ts"),
      "@hiro/supabase-clients": pkg("supabase-clients/src/index.ts"),
    },
  },
});
