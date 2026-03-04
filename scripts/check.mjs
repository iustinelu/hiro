import { spawnSync } from "node:child_process";

const ansi = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

const supportsColor = Boolean(process.stdout.isTTY && process.env.NO_COLOR !== "1");

function color(text, code) {
  if (!supportsColor) return text;
  return `${code}${text}${ansi.reset}`;
}

const checks = [
  { name: "Boundaries", command: ["npm", "run", "check:boundaries"] },
  { name: "Governance", command: ["npm", "run", "check:governance"] },
  { name: "Expo Root Artifacts", command: ["npm", "run", "check:expo-root-artifacts"] },
  { name: "Mobile Runtime", command: ["npm", "run", "check:mobile-runtime"] },
  { name: "Lint", command: ["npm", "run", "lint"] },
  { name: "Typecheck", command: ["npm", "run", "typecheck"] },
  { name: "Test", command: ["npm", "run", "test"] }
];

const results = [];

for (const check of checks) {
  console.log(`\n${color("▶", ansi.cyan)} Running ${check.name}...`);
  const result = spawnSync(check.command[0], check.command.slice(1), {
    stdio: "inherit",
    shell: false
  });

  const passed = result.status === 0;
  results.push({ name: check.name, passed, code: result.status ?? 1 });

  if (passed) {
    console.log(`${color("✅", ansi.green)} ${color(`${check.name} passed`, ansi.green)}`);
  } else {
    console.log(`${color("❌", ansi.red)} ${color(`${check.name} failed`, ansi.red)} ${color(`(exit ${result.status ?? 1})`, ansi.dim)}`);
    break;
  }
}

console.log(`\n${color("Check Summary", ansi.cyan)}`);
for (const result of results) {
  if (result.passed) {
    console.log(`${color("✅", ansi.green)} ${result.name}`);
  } else {
    console.log(`${color("❌", ansi.red)} ${result.name}`);
  }
}

if (results.length < checks.length) {
  for (const skipped of checks.slice(results.length)) {
    console.log(`${color("⏭", ansi.yellow)} ${color(`${skipped.name} (skipped after failure)`, ansi.yellow)}`);
  }
}

const failed = results.find((result) => !result.passed);
if (failed) {
  console.log(`\n${color("Overall: FAILED", ansi.red)}`);
  process.exit(failed.code);
}

console.log(`\n${color("Overall: PASSED", ansi.green)}`);
