import { defineConfig } from "vitest/config";

// Unit tests live next to the pure-logic modules they cover (packages/*). Apps are
// excluded — RN/Next runtime code is exercised via founder QA + the guard scripts,
// not Vitest. Keep this fast so it runs on every `npm run check`.
export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts"],
    environment: "node",
  },
});
