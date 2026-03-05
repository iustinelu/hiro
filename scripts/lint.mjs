import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const sourceRoots = ["apps", "packages", "scripts"];
const lintableExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".sql"]);
const maxLinesPerFile = 400;
const ignoredDirNames = new Set(["node_modules", ".next", "dist", "build", "coverage"]);
const violations = [];
const mobileDisallowedInteractivePrimitives = new Set([
  "Pressable",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
  "TouchableNativeFeedback",
  "TextInput",
  "Switch",
  "Modal"
]);
const webDisallowedIntrinsicInteractiveTags = ["button", "input", "select", "textarea", "form"];

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

    // Enforce DS primitives for app-level interactive controls.
    if (full.startsWith("apps/mobile/src/")) {
      const reactNativeImportMatch = content.match(/import\s*{([^}]*)}\s*from\s*["']react-native["']/m);
      if (reactNativeImportMatch) {
        const importedNames = reactNativeImportMatch[1]
          .split(",")
          .map((item) => item.trim().split(/\s+as\s+/)[0])
          .filter(Boolean);
        for (const name of importedNames) {
          if (mobileDisallowedInteractivePrimitives.has(name)) {
            violations.push(`${full}: do not import react-native ${name} in app layer; use @hiro/ui-primitives/mobile`);
          }
        }
      }
    }

    if (full.startsWith("apps/web/src/") && (full.endsWith(".tsx") || full.endsWith(".jsx"))) {
      for (const tag of webDisallowedIntrinsicInteractiveTags) {
        const regex = new RegExp(`<\\s*${tag}\\b`, "i");
        if (regex.test(content)) {
          violations.push(`${full}: raw <${tag}> in app layer is disallowed; use @hiro/ui-primitives/web`);
        }
      }
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
