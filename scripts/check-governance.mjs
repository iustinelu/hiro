import { readFileSync } from "node:fs";

const requiredFiles = [
  "docs/architecture-standards.md",
  "docs/architecture/founder-qa-workflow.md",
  "README.md",
  "AGENTS.md",
  "CODEOWNERS",
  ".github/ISSUE_TEMPLATE/implementation.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".npmrc",
  "scripts/check-pr-governance.mjs",
  "scripts/prepare-pr-body.mjs",
  "scripts/create-pr.mjs",
  "scripts/check-expo-root-artifacts.mjs",
  "scripts/mobile-orbital-reset.mjs",
  "docs/skills/pr-governance/SKILL.md",
  "docs/skills/pr-governance/agents/openai.yaml",
  "docs/skills/linear-implementation-flow/SKILL.md",
  "docs/skills/linear-implementation-flow/agents/openai.yaml",
  "docs/skills/founder-qa-handoff/SKILL.md",
  "docs/skills/founder-qa-handoff/agents/openai.yaml",
  "docs/skills/branch-pr-lifecycle/SKILL.md",
  "docs/skills/branch-pr-lifecycle/agents/openai.yaml",
  "docs/skills/design-system-change-gate/SKILL.md",
  "docs/skills/design-system-change-gate/agents/openai.yaml"
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

const npmrc = readFileSync(".npmrc", "utf8");
if (!npmrc.includes("legacy-peer-deps=true")) {
  console.error(".npmrc must pin legacy-peer-deps=true for Expo workspace runtime stability.");
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
if (!agents.includes("PR Creation Protocol")) {
  console.error("AGENTS.md must define a PR Creation Protocol.");
  process.exit(1);
}
if (!agents.includes("npm run pr:prepare")) {
  console.error("AGENTS.md must require using npm run pr:prepare.");
  process.exit(1);
}
if (!agents.includes("npm run pr:create:fallback")) {
  console.error("AGENTS.md must require using npm run pr:create:fallback.");
  process.exit(1);
}
if (!agents.includes("Do not use `gh pr create` directly")) {
  console.error("AGENTS.md must explicitly prohibit direct gh pr create usage.");
  process.exit(1);
}
if (!agents.includes("Repository Skills (Mandatory)")) {
  console.error("AGENTS.md must define repository skill requirements.");
  process.exit(1);
}
if (!agents.includes("docs/skills/linear-implementation-flow/SKILL.md")) {
  console.error("AGENTS.md must reference linear-implementation-flow skill.");
  process.exit(1);
}
if (!agents.includes("docs/skills/founder-qa-handoff/SKILL.md")) {
  console.error("AGENTS.md must reference founder-qa-handoff skill.");
  process.exit(1);
}
if (!agents.includes("docs/skills/branch-pr-lifecycle/SKILL.md")) {
  console.error("AGENTS.md must reference branch-pr-lifecycle skill.");
  process.exit(1);
}
if (!agents.includes("docs/skills/design-system-change-gate/SKILL.md")) {
  console.error("AGENTS.md must reference design-system-change-gate skill.");
  process.exit(1);
}
if (!agents.includes("docs/skills/pr-governance/SKILL.md")) {
  console.error("AGENTS.md must reference pr-governance skill.");
  process.exit(1);
}
if (!agents.includes("Use design-system primitives/tokens for all app UI elements")) {
  console.error("AGENTS.md must require design-system-first UI usage.");
  process.exit(1);
}
if (!agents.includes("implement it in `packages/ui-primitives`")) {
  console.error("AGENTS.md must require adding missing primitives to packages/ui-primitives first.");
  process.exit(1);
}

const architectureStandards = readFileSync("docs/architecture-standards.md", "utf8");
if (!architectureStandards.includes("must not introduce raw platform interactive elements")) {
  console.error("Architecture standards must prohibit raw app-layer platform interactive elements.");
  process.exit(1);
}
if (!architectureStandards.includes("implement the primitive in `packages/ui-primitives` first")) {
  console.error("Architecture standards must require implementing missing primitives in packages/ui-primitives first.");
  process.exit(1);
}

console.log("Governance checks passed.");
