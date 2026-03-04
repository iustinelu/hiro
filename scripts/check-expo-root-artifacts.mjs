import { existsSync } from "node:fs";

const forbiddenPaths = [
  { path: "android", type: "directory" },
  { path: "ios", type: "directory" },
  { path: "app.json", type: "file" }
];

const found = forbiddenPaths.filter((entry) => existsSync(entry.path));

if (found.length > 0) {
  console.error("Expo root artifact check failed.");
  console.error("These root-level Expo artifacts are not allowed:");
  for (const entry of found) {
    console.error(`- ${entry.path} (${entry.type})`);
  }
  console.error(
    [
      "",
      "Recovery:",
      "1. Remove accidental root artifacts:",
      "   rm -rf android ios app.json",
      "2. Run runtime checks:",
      "   npm run check:expo-root-artifacts",
      "   npm run check:mobile-runtime",
      "3. Run Expo commands from apps/mobile only."
    ].join("\n")
  );
  process.exit(1);
}

console.log("Expo root artifact check passed: no forbidden root android/ios/app.json artifacts found.");
