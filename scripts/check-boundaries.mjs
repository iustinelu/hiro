import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["apps", "packages"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);
// Never descend into dependency/build output — walking node_modules is slow and
// a false-positive surface (a dep's source may contain a matching import string).
const skipDirs = new Set(["node_modules", ".next", ".expo", "dist", "build", "coverage", "android", "ios"]);
const violations = [];

// The app talks to Supabase only through its service layer (`apps/mobile/src/lib/*`).
// Screens/components/onboarding must consume those services (or hooks), never the
// raw client — this keeps data access, error mapping, and RPC names in one place.
const supabaseCallRegex = /\bsupabase\s*\.\s*(from|rpc|auth|storage|functions|channel)\b/;

function isMobileAppLayer(path) {
  if (!path.startsWith(join("apps", "mobile", "src"))) return false;
  const libDir = join("apps", "mobile", "src", "lib");
  return !path.startsWith(libDir);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) {
      continue;
    }
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

    const appToApp = content.match(/from\s+["']apps\/\w+\//g) || [];
    if (appToApp.length > 0) {
      violations.push(`${full}: imports from apps/* are not allowed`);
    }

    if (full.startsWith("packages/domain") && /@hiro\/(ui-primitives|ui-tokens)/.test(content)) {
      violations.push(`${full}: packages/domain cannot import UI packages`);
    }

    if (isMobileAppLayer(full) && supabaseCallRegex.test(content)) {
      violations.push(
        `${full}: direct supabase.* call outside apps/mobile/src/lib; add/use a service function in src/lib instead`
      );
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
