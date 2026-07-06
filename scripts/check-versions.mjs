import { readFileSync } from "node:fs";

// The marketing/app version lives in apps/mobile/app.json (the store-facing
// version, bumped by hand per release). The monorepo root package.json should
// track it so `git tag vX.Y.Z` and the repo agree with what ships. This asserts
// the two never silently drift apart.

const rootVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
const appJson = JSON.parse(readFileSync("apps/mobile/app.json", "utf8"));
const appVersion = appJson.expo?.version;

if (!appVersion) {
  console.error("Version check failed: apps/mobile/app.json is missing expo.version.");
  process.exit(1);
}

if (rootVersion !== appVersion) {
  console.error(
    [
      "Version check failed: root package.json and apps/mobile/app.json disagree.",
      `- package.json version:        ${rootVersion}`,
      `- apps/mobile/app.json version: ${appVersion}`,
      "Align both (and tag the release commit vX.Y.Z) before shipping.",
    ].join("\n")
  );
  process.exit(1);
}

console.log(`Version check passed: root and app.json both at ${rootVersion}.`);
