import { existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const resetTargets = [
  "node_modules",
  "apps/mobile/node_modules",
  "apps/web/node_modules",
  "packages/ui-primitives/node_modules",
  "apps/mobile/.expo",
  "android",
  "ios",
  "app.json"
];

function runStep(command, args, options = {}) {
  const label = [command, ...args].join(" ");
  console.log(`\n[mobile:reset] ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[mobile:reset] Starting deterministic mobile runtime reset.");

for (const target of resetTargets) {
  if (!existsSync(target)) {
    continue;
  }

  rmSync(target, { recursive: true, force: true });
  console.log(`[mobile:reset] Removed ${target}`);
}

runStep("npm", ["install"]);
runStep("npm", ["run", "check:expo-root-artifacts"]);
runStep("npm", ["run", "check:mobile-runtime"]);
runStep("npx", ["expo-doctor"], { cwd: "apps/mobile" });

console.log(
  [
    "",
    "[mobile:reset] Reset complete.",
    "[mobile:reset] Start mobile with:",
    "npm run dev --workspace @hiro/mobile -- --clear --tunnel"
  ].join("\n")
);
