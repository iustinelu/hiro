import { readFileSync } from "node:fs";
import { stdin } from "node:process";

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

function fail(messages) {
  const list = Array.isArray(messages) ? messages : [messages];
  list.forEach((message) => console.error(message));
  process.exit(1);
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => {
      data += chunk;
    });
    stdin.on("end", () => resolve(data));
    stdin.on("error", reject);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const fileFlagIndex = args.indexOf("--file");
  const useStdin = args.includes("--stdin");

  if (fileFlagIndex !== -1) {
    const filePath = args[fileFlagIndex + 1];
    if (!filePath) fail("Usage: node scripts/check-pr-governance.mjs --file <path>");
    return { mode: "file", filePath };
  }

  if (useStdin) return { mode: "stdin" };

  return { mode: "github_event" };
}

async function loadPrContext() {
  const { mode, filePath } = parseArgs();

  if (mode === "file") {
    return { title: "", body: readFileSync(filePath, "utf8") };
  }

  if (mode === "stdin") {
    return { title: "", body: await readStdin() };
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

  return {
    title: pullRequest.title ?? "",
    body: pullRequest.body ?? ""
  };
}

const { title, body } = await loadPrContext();
const titleAndBody = `${title}\n${body}`;

if (!/HIR-\d+/i.test(titleAndBody)) {
  fail("PR must reference a Linear issue ID (example: HIR-29) in title or body.");
}

const missingChecklistItems = [];
for (const item of requiredChecklistItems) {
  const checkedPattern = new RegExp(`- \\[[xX]\\] ${escapeRegex(item)}`);
  if (!checkedPattern.test(body)) {
    missingChecklistItems.push(item);
  }
}

if (missingChecklistItems.length > 0) {
  const errors = [
    "PR is missing required checked checklist items:",
    ...missingChecklistItems.map((item) => `- ${item}`)
  ];
  fail(errors);
}

if (!/founder manual qa sign-off/i.test(body)) {
  fail("PR must include founder QA gate language in the PR body.");
}

console.log("PR governance checks passed.");
