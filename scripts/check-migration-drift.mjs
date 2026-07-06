import { readdirSync, readFileSync, existsSync } from "node:fs";

// Live migration-drift guard for the shared dev+prod Supabase project.
//
// Migrations are applied to the live DB via the Supabase MCP/CLI (not a build
// step), so the repo and the DB can silently diverge — exactly what commit
// ec228fc had to recover from ("recover 2 dropped migrations"). This compares
// the committed migration files against what the live DB reports as applied.
//
// Comparison is by migration NAME (the slug after the timestamp), not by the
// timestamp: 15 historical files use synthetic timestamps that never matched
// the real apply-time versions, so a version comparison would be all noise.
//
// Directions are treated differently on purpose:
//   - committed-but-NOT-applied  → FAIL: the deployed schema lags the code.
//   - applied-but-NOT-committed  → WARN: normally a sibling worktree that is
//     ahead of merge (a documented, expected pattern here); don't break
//     unrelated PRs for it, but surface it loudly.
//
// No PAT (contributors without DB creds) or an API error → skip with a warning
// and exit 0, so `npm run check` stays green off the network.

const PROJECT_REF = "pfokfopwjrahclmseper";
const MIGRATIONS_DIR = "supabase/migrations";
const PAT_FILE = ".secrets/supabase-pat";

function readPat() {
  if (process.env.SUPABASE_PAT && process.env.SUPABASE_PAT.trim()) {
    return process.env.SUPABASE_PAT.trim();
  }
  if (existsSync(PAT_FILE)) {
    return readFileSync(PAT_FILE, "utf8").trim();
  }
  return null;
}

const pat = readPat();
if (!pat) {
  console.log("⏭  Migration drift check skipped: no SUPABASE_PAT env var or .secrets/supabase-pat file.");
  console.log("   (Expected for contributors without DB credentials; CI supplies the PAT.)");
  process.exit(0);
}

// Parse committed migrations as <version>_<name>.sql.
const localByName = new Map();
for (const file of readdirSync(MIGRATIONS_DIR)) {
  if (!file.endsWith(".sql")) continue;
  const match = file.match(/^(\d+)_(.+)\.sql$/);
  if (!match) {
    console.error(`Migration drift check failed: '${file}' does not match <version>_<name>.sql.`);
    process.exit(1);
  }
  localByName.set(match[2], match[1]);
}

async function fetchApplied() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      // A normal User-Agent avoids Cloudflare 1010 on the Management API.
      "User-Agent": "hiro-migration-drift-check",
    },
    body: JSON.stringify({
      query: "select version, name from supabase_migrations.schema_migrations order by version;",
    }),
  });
  if (!res.ok) {
    throw new Error(`Management API query failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : (json.result ?? []);
}

let appliedRows;
try {
  appliedRows = await fetchApplied();
} catch (err) {
  console.log(`⏭  Migration drift check skipped: could not reach the Supabase Management API.\n   ${err.message}`);
  process.exit(0);
}

const appliedByName = new Map();
for (const row of appliedRows) {
  appliedByName.set(row.name ?? row.version, row.version);
}

const missingFromDb = [...localByName.keys()].filter((name) => !appliedByName.has(name));
const missingLocally = [...appliedByName.keys()].filter((name) => !localByName.has(name));

if (missingLocally.length > 0) {
  console.log("⚠  Applied migrations with no committed file (a sibling branch may be ahead of merge, or a stray apply):");
  for (const name of missingLocally) console.log(`   - ${appliedByName.get(name)}_${name}`);
}

if (missingFromDb.length > 0) {
  console.error("Migration drift check FAILED: committed migrations that are NOT applied to the live DB:");
  for (const name of missingFromDb) console.error(`   - ${localByName.get(name)}_${name}.sql`);
  console.error("Apply them via the Supabase MCP/CLI before merging, or the deployed schema will lag the code.");
  process.exit(1);
}

const pending = missingLocally.length
  ? ` (${missingLocally.length} newer applied migration(s) pending merge — see above)`
  : "";
console.log(`Migration drift check passed: all ${localByName.size} committed migrations are applied${pending}.`);
