import { spawnSync } from "node:child_process";

function usageAndExit() {
  console.error(
    "Usage: node scripts/create-pr.mjs --title <title> --body-file <path> [--base main] [--head <branch>]"
  );
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const getArgValue = (name) => {
    const index = args.indexOf(name);
    if (index === -1) return "";
    return args[index + 1] ?? "";
  };

  const title = getArgValue("--title");
  const bodyFile = getArgValue("--body-file");
  const base = getArgValue("--base") || "main";
  const head = getArgValue("--head");

  if (!title || !bodyFile) usageAndExit();
  return { title, bodyFile, base, head };
}

function runCommand(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const { title, bodyFile, base, head } = parseArgs();

runCommand("node", [
  "scripts/check-pr-governance.mjs",
  "--file",
  bodyFile,
  "--title",
  title
]);

const ghArgs = ["pr", "create", "--base", base, "--title", title, "--body-file", bodyFile];
if (head) ghArgs.push("--head", head);
runCommand("gh", ghArgs);
