import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const sourceRoots = ["apps", "packages", "scripts"];
const lintableExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".sql"]);
const maxLinesPerFile = 400;
const ignoredDirNames = new Set(["node_modules", ".next", "dist", "build", "coverage"]);
const violations = [];

function hasLintableExtension(path) {
  return [...lintableExtensions].some((ext) => path.endsWith(ext));
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      if (ignoredDirNames.has(entry)) {
        continue;
      }
      walk(full);
      continue;
    }

    if (!hasLintableExtension(full)) {
      continue;
    }

    const content = readFileSync(full, "utf8");
    const lineCount = content.split(/\r?\n/).length;

    if (lineCount > maxLinesPerFile) {
      violations.push(`${full}: ${lineCount} lines exceeds hard limit of ${maxLinesPerFile}`);
    }

    // Enforce tokenized colors outside token package.
    const isTokenSource = full.startsWith("packages/ui-tokens/");
    if (!isTokenSource && /#[0-9a-fA-F]{3,8}\b/.test(content)) {
      violations.push(`${full}: hardcoded hex color found; use packages/ui-tokens`);
    }
  }
}

for (const root of sourceRoots) {
  try {
    walk(root);
  } catch {
    // Root may be absent in early bootstrap stages.
  }
}

if (violations.length > 0) {
  console.error("Lint violations detected:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Lint passed.");
