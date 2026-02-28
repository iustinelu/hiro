import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["apps", "packages"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (![...exts].some((ext) => full.endsWith(ext))) {
      continue;
    }
    const content = readFileSync(full, "utf8");

    const appToApp = content.match(/from\s+["']apps\/(web|mobile)\//g) || [];
    if (appToApp.length > 0) {
      violations.push(`${full}: imports from apps/* are not allowed`);
    }

    if (full.startsWith("packages/domain") && /@hiro\/(ui-primitives|ui-tokens)/.test(content)) {
      violations.push(`${full}: packages/domain cannot import UI packages`);
    }
  }
}

for (const root of roots) {
  try {
    walk(root);
  } catch {
    // root may not exist in early bootstrap steps
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations detected:\n");
  for (const line of violations) console.error(`- ${line}`);
  process.exit(1);
}

console.log("Boundary check passed.");
