import { spawnSync } from "node:child_process";

const tsconfigs = [
  "apps/web/tsconfig.json",
  "apps/mobile/tsconfig.json",
  "packages/domain/tsconfig.json",
  "packages/runtime/tsconfig.json",
  "packages/supabase-clients/tsconfig.json",
  "packages/ui-tokens/tsconfig.json",
  "packages/ui-primitives/tsconfig.json"
];

for (const projectPath of tsconfigs) {
  const result = spawnSync(
    "./node_modules/.bin/tsc",
    ["--noEmit", "--incremental", "false", "-p", projectPath],
    {
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Typecheck passed.");
