import { readFileSync } from "node:fs";

const requiredFiles = [
  "docs/architecture-standards.md",
  "README.md",
  ".github/ISSUE_TEMPLATE/implementation.md",
  ".github/PULL_REQUEST_TEMPLATE.md"
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

const issueTemplate = readFileSync(".github/ISSUE_TEMPLATE/implementation.md", "utf8");
if (!issueTemplate.includes("Founder QA Stop-Point")) {
  console.error("Issue template must include Founder QA Stop-Point");
  process.exit(1);
}

if (!issueTemplate.includes("Compliance Checklist")) {
  console.error("Issue template must include compliance checklist");
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

console.log("Governance checks passed.");
