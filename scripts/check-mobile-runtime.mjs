import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const REQUIRED_EXPO_MAJOR = 54;
const EXPECTED_RN_BY_EXPO_MAJOR = {
  54: "0.81.5"
};

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

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

function getDependency(pkg, name, packagePath) {
  const value = pkg.dependencies?.[name];
  if (!value || typeof value !== "string") {
    fail([`Mobile runtime check failed: missing dependencies.${name} in ${packagePath}.`]);
  }
  return value;
}

function lockfileVersions(lockfile, dependency) {
  const versions = new Set();
  for (const [packagePath, packageData] of Object.entries(lockfile.packages ?? {})) {
    if (!packagePath.endsWith(`/node_modules/${dependency}`)) {
      continue;
    }
    if (typeof packageData?.version === "string") {
      versions.add(packageData.version);
    }
  }
  return [...versions].sort();
}

function validateInstalledTree() {
  const command = ["ls", "react", "react-dom", "react-native", "@expo/vector-icons", "expo-font", "--all", "--json"];
  const result = spawnSync("npm", command, {
    stdio: "pipe",
    encoding: "utf8",
    shell: false
  });

  if (result.status !== 0) {
    const stdout = (result.stdout ?? "").trim();
    const stderr = (result.stderr ?? "").trim();
    fail(
      [
        "Mobile runtime check failed: installed dependency tree contains invalid/extraneous runtime packages.",
        "Fix:",
        "1. npm run mobile:reset",
        "2. npm run check:mobile-runtime",
        "3. cd apps/mobile && npx expo-doctor",
        stdout ? `npm ls output:\n${stdout}` : "",
        stderr ? `npm ls error:\n${stderr}` : ""
      ].filter(Boolean)
    );
  }
}

const mobilePackage = JSON.parse(readFileSync("apps/mobile/package.json", "utf8"));
const webPackage = JSON.parse(readFileSync("apps/web/package.json", "utf8"));
const lockfile = JSON.parse(readFileSync("package-lock.json", "utf8"));
const expoRange = mobilePackage.dependencies?.expo;

if (!expoRange || typeof expoRange !== "string") {
  fail(["Mobile runtime check failed: apps/mobile/package.json is missing dependencies.expo."]);
}

const parsed = parseVersion(expoRange);
if (!parsed) {
  fail([`Mobile runtime check failed: cannot parse Expo version from '${expoRange}'.`]);
}

if (parsed.major < REQUIRED_EXPO_MAJOR) {
  fail(
    [
      `Mobile runtime check failed: project is pinned to Expo SDK ${parsed.major} (${expoRange}), but minimum required is SDK ${REQUIRED_EXPO_MAJOR}.`,
      "Upgrade SDK before founder QA to avoid Expo Go incompatibility when scanning QR on physical devices.",
      "Recommended: run 'npx expo install expo@~54.0.0' in apps/mobile and align dependencies with 'npx expo install --fix'."
    ]
  );
}

const mobileReact = getDependency(mobilePackage, "react", "apps/mobile/package.json");
const webReact = getDependency(webPackage, "react", "apps/web/package.json");
const mobileReactDom = getDependency(mobilePackage, "react-dom", "apps/mobile/package.json");
const webReactDom = getDependency(webPackage, "react-dom", "apps/web/package.json");
const mobileReactNative = getDependency(mobilePackage, "react-native", "apps/mobile/package.json");

if (mobileReact !== webReact) {
  fail(
    [
      "Mobile runtime check failed: react version mismatch between web and mobile.",
      `- apps/mobile: ${mobileReact}`,
      `- apps/web: ${webReact}`,
      "Fix: align both to the same exact version."
    ]
  );
}

if (mobileReactDom !== webReactDom) {
  fail(
    [
      "Mobile runtime check failed: react-dom version mismatch between web and mobile.",
      `- apps/mobile: ${mobileReactDom}`,
      `- apps/web: ${webReactDom}`,
      "Fix: align both to the same exact version."
    ]
  );
}

const expectedRn = EXPECTED_RN_BY_EXPO_MAJOR[parsed.major];
if (expectedRn && mobileReactNative !== expectedRn) {
  fail(
    [
      `Mobile runtime check failed: Expo SDK ${parsed.major} expects react-native ${expectedRn}.`,
      `- apps/mobile: ${mobileReactNative}`,
      "Fix: align apps/mobile/package.json to the expected react-native version."
    ]
  );
}

for (const dependency of ["react", "react-dom", "react-native", "expo-font"]) {
  const versions = lockfileVersions(lockfile, dependency);
  if (versions.length > 1) {
    fail(
      [
        `Mobile runtime check failed: multiple installed ${dependency} versions detected in package-lock.json.`,
        `- Versions: ${versions.join(", ")}`,
        "Fix:",
        "1. npm install",
        "2. npm run check:mobile-runtime",
        "3. cd apps/mobile && npx expo-doctor"
      ]
    );
  }
}

validateInstalledTree();

console.log(`Mobile runtime check passed: Expo SDK ${parsed.major} (${expoRange}).`);
console.log(`Mobile runtime check passed: react=${mobileReact} react-dom=${mobileReactDom} react-native=${mobileReactNative}.`);
console.log("Founder QA note: if Expo Go and project SDK diverge again, use a dev build or upgrade SDK before QA.");
