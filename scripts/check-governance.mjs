import { readFileSync } from "node:fs";

const requiredFiles = [
  "docs/architecture-standards.md",
  "docs/architecture/founder-qa-workflow.md",
  "README.md",
  "AGENTS.md",
  "CODEOWNERS",
  ".github/ISSUE_TEMPLATE/implementation.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "scripts/check-pr-governance.mjs"
];

for (const file of requiredFiles) {
  try {
    readFileSync(file, "utf8");
  } catch {
    console.error(`Missing required governance file: ${file}`);
    process.exit(1);
  }
}

const readme = readFileSync("README.md", "utf8");
if (!readme.includes("docs/architecture-standards.md")) {
  console.error("README.md must link to docs/architecture-standards.md");
  process.exit(1);
}
if (!readme.includes("docs/architecture/founder-qa-workflow.md")) {
  console.error("README.md must link to docs/architecture/founder-qa-workflow.md");
  process.exit(1);
}

const issueTemplate = readFileSync(".github/ISSUE_TEMPLATE/implementation.md", "utf8");
if (!issueTemplate.includes("Founder QA Stop-Point")) {
  console.error("Issue template must include Founder QA Stop-Point");
  process.exit(1);
}

if (!issueTemplate.includes("Compliance Checklist")) {
  console.error("Issue template must include compliance checklist");
  process.exit(1);
}
if (!issueTemplate.includes("Do not mark this ticket Done")) {
  console.error("Issue template must include explicit do-not-close language");
  process.exit(1);
}
if (!issueTemplate.includes("Founder QA Quick Cycle")) {
  console.error("Issue template must include Founder QA Quick Cycle");
  process.exit(1);
}
if (!issueTemplate.includes("Commands (exact)")) {
  console.error("Issue template must require exact founder QA commands");
  process.exit(1);
}
if (!issueTemplate.includes("Pass/Fail")) {
  console.error("Issue template must require pass/fail founder QA criteria");
  process.exit(1);
}

const prTemplate = readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf8");
if (!prTemplate.includes("Founder QA Gate")) {
  console.error("PR template must include Founder QA Gate");
  process.exit(1);
}

if (!prTemplate.includes("Compliance Checklist")) {
  console.error("PR template must include compliance checklist");
  process.exit(1);
}
if (!prTemplate.includes("must not be treated as final complete")) {
  console.error("PR template must include explicit founder QA gate language");
  process.exit(1);
}
if (!prTemplate.includes("Founder QA Quick Cycle")) {
  console.error("PR template must include Founder QA Quick Cycle");
  process.exit(1);
}
if (!prTemplate.includes("Commands (exact)")) {
  console.error("PR template must require exact founder QA commands");
  process.exit(1);
}
if (!prTemplate.includes("Pass/Fail")) {
  console.error("PR template must require pass/fail founder QA criteria");
  process.exit(1);
}

const codeowners = readFileSync("CODEOWNERS", "utf8");
if (!codeowners.includes("@targovetiustin")) {
  console.error("CODEOWNERS must require founder review ownership.");
  process.exit(1);
}

const agents = readFileSync("AGENTS.md", "utf8");
if (!agents.includes("Agent Execution Contract")) {
  console.error("AGENTS.md must define the execution contract.");
  process.exit(1);
}
if (!agents.includes("do not mark `Done`")) {
  console.error("AGENTS.md must enforce founder QA stop-point behavior.");
  process.exit(1);
}
if (!agents.includes("Founder QA Quick Cycle")) {
  console.error("AGENTS.md must require Founder QA Quick Cycle in handoff.");
  process.exit(1);
}

console.log("Governance checks passed.");
