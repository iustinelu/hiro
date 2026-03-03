import { readFileSync } from "node:fs";

const REQUIRED_EXPO_MAJOR = 54;

function parseVersion(raw) {
  const match = raw.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

const mobilePackage = JSON.parse(readFileSync("apps/mobile/package.json", "utf8"));
const expoRange = mobilePackage.dependencies?.expo;

if (!expoRange || typeof expoRange !== "string") {
  console.error("Mobile runtime check failed: apps/mobile/package.json is missing dependencies.expo.");
  process.exit(1);
}

const parsed = parseVersion(expoRange);
if (!parsed) {
  console.error(`Mobile runtime check failed: cannot parse Expo version from '${expoRange}'.`);
  process.exit(1);
}

if (parsed.major < REQUIRED_EXPO_MAJOR) {
  console.error(
    [
      `Mobile runtime check failed: project is pinned to Expo SDK ${parsed.major} (${expoRange}), but minimum required is SDK ${REQUIRED_EXPO_MAJOR}.`,
      "Upgrade SDK before founder QA to avoid Expo Go incompatibility when scanning QR on physical devices.",
      "Recommended: run 'npx expo install expo@~54.0.0' in apps/mobile and align dependencies with 'npx expo install --fix'."
    ].join("\n")
  );
  process.exit(1);
}

console.log(`Mobile runtime check passed: Expo SDK ${parsed.major} (${expoRange}).`);
console.log("Founder QA note: if Expo Go and project SDK diverge again, use a dev build or upgrade SDK before QA.");
