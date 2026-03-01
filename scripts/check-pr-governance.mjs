import { readFileSync } from "node:fs";

const requiredChecklistItems = [
  "I followed `/docs/architecture-standards.md`",
  "I validated architecture boundaries/import direction",
  "I handled loading/empty/error or marked N/A",
  "I handled schema/migration/RLS impact or marked N/A",
  "I used design tokens/primitives or documented exception",
  "I documented runtime/env impact",
  "I updated relevant docs/ownership README files",
  "Founder QA stop-point has been respected"
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (!process.env.GITHUB_EVENT_PATH) {
  console.log("Skipping PR governance check (not running in GitHub Actions).");
  process.exit(0);
}

const eventPayload = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const pullRequest = eventPayload.pull_request;

if (!pullRequest) {
  console.log("Skipping PR governance check (event is not pull_request).");
  process.exit(0);
}

const title = pullRequest.title ?? "";
const body = pullRequest.body ?? "";
const titleAndBody = `${title}\n${body}`;

if (!/HIR-\d+/i.test(titleAndBody)) {
  fail("PR must reference a Linear issue ID (example: HIR-29) in title or body.");
}

for (const item of requiredChecklistItems) {
  const checkedPattern = new RegExp(`- \\[[xX]\\] ${escapeRegex(item)}`);
  if (!checkedPattern.test(body)) {
    fail(`PR checklist item is not checked: "${item}"`);
  }
}

if (!/founder manual qa sign-off/i.test(body)) {
  fail("PR must include founder QA gate language in the PR body.");
}

console.log("PR governance checks passed.");
