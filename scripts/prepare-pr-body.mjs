import { readFileSync, writeFileSync } from "node:fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const outFlagIndex = args.indexOf("--out");
  const outPath = outFlagIndex !== -1 ? args[outFlagIndex + 1] : "/tmp/pr_body.md";
  if (!outPath) {
    console.error("Usage: node scripts/prepare-pr-body.mjs [--out /tmp/pr_body.md]");
    process.exit(1);
  }
  return { outPath };
}

const { outPath } = parseArgs();
const template = readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf8");
writeFileSync(outPath, template, "utf8");
console.log(`PR template copied to ${outPath}`);
