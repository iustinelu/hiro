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

// Files exempt from theme-reactivity rules. Keep this list TINY and justified:
// - theming infrastructure that legitimately bridges tokens <-> CSS variables
// - surfaces that render before a theme is available / non-UI metadata
// - design-system showcases that intentionally display raw token values
const themingAllowlist = [
  "packages/ui-primitives/src/web/utils.ts",
  "packages/ui-primitives/src/mobile/utils.ts",
  "apps/web/src/theme/",
  "apps/web/src/app/manifest.ts",
  "apps/web/src/app/layout.tsx",
  "apps/web/src/app/global-error.tsx",
  "apps/web/src/app/design-system/",
  "apps/mobile/src/screens/DesignSystemGallery.tsx",
  "apps/mobile/src/components/ErrorBoundary.tsx",
  // Design-system documentation/showcase components — display raw token values,
  // only rendered inside the (allowlisted) galleries.
  "IconographySpec",
  "SpacingMatrix",
  "NavigationPattern"
];

function isThemingAllowlisted(path) {
  return themingAllowlist.some((entry) => path.includes(entry));
}

// Raw color literals that don't react to the active theme.
const colorLiteralRegex = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/;
// Static THEMED token access (color/elevation/radius/fontFamily) — bakes in the
// default theme. Structural tokens (spacing/size/motion/typography sizes) are fine.
const staticThemedTokenRegex =
  /\btokens\.(?:color|elevation|radius)\.|\btokens\.typography\.fontFamily(?:Mono)?\b/;

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

    // Theme-reactivity rules. The token package defines values; everything else
    // must consume them through the theme-reactive path so all 4 themes apply.
    const isTokenSource = full.startsWith("packages/ui-tokens/");
    const inThemeReactiveScope =
      full.startsWith("apps/") || full.startsWith("packages/ui-primitives/");
    const themingExempt = isTokenSource || isThemingAllowlisted(full);

    // 1) No raw color literals (hex/rgb/rgba/hsl) — they never react to the theme.
    if (!themingExempt && colorLiteralRegex.test(content)) {
      violations.push(
        `${full}: hardcoded color literal; theme via cssColor()/useTheme() or add a token in packages/ui-tokens`
      );
    }

    // 2) No static themed-token access in app/primitive render code — it bakes in
    //    the default theme and won't change when the user switches themes.
    if (inThemeReactiveScope && !themingExempt && staticThemedTokenRegex.test(content)) {
      violations.push(
        `${full}: static themed token (color/elevation/radius/fontFamily) is not theme-reactive; use cssColor()/cssShadow()/cssRadius()/cssFontFamily() (web) or useTheme() (mobile)`
      );
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
