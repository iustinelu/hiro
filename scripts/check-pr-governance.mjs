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

const requiredSectionHeaders = [
  "## Summary",
  "## What Changed",
  "## Compliance Checklist (Required)",
  "## Founder QA Gate",
  "## Founder QA Quick Cycle (Required)",
  "## Emergency Deviation (optional)"
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
  const titleFlagIndex = args.indexOf("--title");

  const providedTitle = titleFlagIndex !== -1 ? args[titleFlagIndex + 1] ?? "" : "";

  if (fileFlagIndex !== -1) {
    const filePath = args[fileFlagIndex + 1];
    if (!filePath) fail("Usage: node scripts/check-pr-governance.mjs --file <path>");
    return { mode: "file", filePath, title: providedTitle };
  }

  if (useStdin) return { mode: "stdin", title: providedTitle };

  return { mode: "github_event", title: providedTitle };
}

async function loadPrContext() {
  const { mode, filePath, title: providedTitle } = parseArgs();

  if (mode === "file") {
    return { title: providedTitle, body: readFileSync(filePath, "utf8") };
  }

  if (mode === "stdin") {
    return { title: providedTitle, body: await readStdin() };
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

const missingHeaders = requiredSectionHeaders.filter((header) => !body.includes(header));
if (missingHeaders.length > 0) {
  fail([
    "PR body is missing required template section headers:",
    ...missingHeaders.map((header) => `- ${header}`)
  ]);
}

const headerOrder = requiredSectionHeaders.map((header) => body.indexOf(header));
if (headerOrder.some((index) => index === -1)) {
  fail("PR body does not contain all required template headers.");
}
for (let idx = 1; idx < headerOrder.length; idx += 1) {
  if (headerOrder[idx] <= headerOrder[idx - 1]) {
    fail("PR template section headers are out of order.");
  }
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

if (!/- Commands \(exact\):/i.test(body)) {
  fail("Founder QA Quick Cycle must include `Commands (exact)`.");
}
if (!/- Validate \(exact target\):/i.test(body)) {
  fail("Founder QA Quick Cycle must include `Validate (exact target)`.");
}
if (!/- Look for:/i.test(body)) {
  fail("Founder QA Quick Cycle must include `Look for`.");
}
if (!/- Pass\/Fail:/i.test(body)) {
  fail("Founder QA Quick Cycle must include `Pass/Fail`.");
}

console.log("PR governance checks passed.");
