import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// Migration guard
//
// Catches two classes of bug we hit in production:
//
// 1. Function-overload ambiguity. PostgREST calls RPCs by name with named params.
//    If a function name has more than one live signature (e.g. create_household(text)
//    AND create_household(text, text default ...)), a call can match both and Postgres
//    errors: "Could not choose the best candidate function". CREATE OR REPLACE with a
//    NEW signature does NOT drop the old overload, so this happens silently.
//    Rule: every public function may have at most ONE live signature across migrations
//    (after accounting for DROP FUNCTION). Redefine via CREATE OR REPLACE with the same
//    signature, or DROP the old overload first.
//
// 2. RPC calls to undefined functions. Every `.rpc("name", ...)` in app source must
//    resolve to a function defined (and not dropped) in the migrations.
//
// 3. Error-code drift across the SQL↔TS boundary. SQL `raise exception 'CODE'` strings are the
//    contract the client matches against via `ServiceErrorCode` (packages/domain/src/errors.ts).
//    A typo or rename on either side silently breaks error handling. Rule: the set of client-facing
//    raised codes and the `ServiceErrorCode` enum must be identical (modulo INTERNAL_ONLY_CODES).
// ─────────────────────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = "supabase/migrations";
const ERROR_ENUM_FILE = "packages/domain/src/errors.ts";
// Codes raised in SQL that are deliberately NOT mapped on the client (internal preconditions the
// user never sees). Keep this list tiny and justified.
const INTERNAL_ONLY_CODES = new Set(["NOT_AUTHENTICATED", "INVALID_PLATFORM"]);
const APP_DIRS = ["apps/web/src", "apps/mobile/src"];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", ".expo", ".turbo"]);

function fail(lines) {
  console.error("Migration check FAILED:\n");
  console.error(lines.join("\n"));
  process.exit(1);
}

// Return the balanced (...) substring starting at the index of an opening paren.
function readBalanced(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return text.slice(openIdx + 1, i);
    }
  }
  return null;
}

// Count top-level args (commas not nested in () or []).
function arity(argString) {
  const trimmed = argString.trim();
  if (!trimmed) return 0;
  let depth = 0;
  let count = 1;
  for (const ch of trimmed) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) count++;
  }
  return count;
}

// ── Parse migrations in filename (= timestamp) order ──────────────────────────
const migrationFiles = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

// name -> Set<arity> of live signatures
const liveSignatures = new Map();

function addSig(name, ar) {
  if (!liveSignatures.has(name)) liveSignatures.set(name, new Set());
  liveSignatures.get(name).add(ar);
}
function dropSig(name, ar) {
  const set = liveSignatures.get(name);
  if (!set) return;
  if (ar === null) set.clear();
  else set.delete(ar);
}

const createRe = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?(\w+)\s*\(/gi;
const dropRe = /drop\s+function\s+(?:if\s+exists\s+)?(?:public\.)?(\w+)\s*(\()?/gi;

for (const file of migrationFiles) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");

  // DROPs first per file is not strictly ordered vs CREATEs within a file, but in
  // practice a migration that drops-then-creates is fine because they target distinct
  // signatures. Process CREATEs and DROPs in source order.
  const events = [];
  let m;
  createRe.lastIndex = 0;
  while ((m = createRe.exec(sql)) !== null) {
    const openIdx = createRe.lastIndex - 1;
    const args = readBalanced(sql, openIdx);
    if (args === null) continue;
    events.push({ idx: m.index, type: "create", name: m[1], ar: arity(args) });
  }
  dropRe.lastIndex = 0;
  while ((m = dropRe.exec(sql)) !== null) {
    if (m[2] === "(") {
      const openIdx = dropRe.lastIndex - 1;
      const args = readBalanced(sql, openIdx);
      events.push({ idx: m.index, type: "drop", name: m[1], ar: args === null ? null : arity(args) });
    } else {
      events.push({ idx: m.index, type: "drop", name: m[1], ar: null });
    }
  }

  events.sort((a, b) => a.idx - b.idx);
  for (const ev of events) {
    if (ev.type === "create") addSig(ev.name, ev.ar);
    else dropSig(ev.name, ev.ar);
  }
}

// ── Rule 1: no function may have more than one live signature ──────────────────
const overloaded = [];
for (const [name, arities] of liveSignatures) {
  if (arities.size > 1) {
    overloaded.push(`  - ${name}: ${[...arities].sort().map((a) => `${a}-arg`).join(", ")}`);
  }
}
if (overloaded.length > 0) {
  fail([
    "Overloaded public function(s) detected (PostgREST cannot disambiguate by-name RPC calls):",
    ...overloaded,
    "",
    "Fix: drop the redundant overload(s) in a migration, e.g.",
    "  drop function if exists public.your_function(text);",
    "Keep a single signature; use a default-valued parameter if callers vary.",
  ]);
}

// ── Rule 2: every .rpc("name") call resolves to a defined function ─────────────
const definedNames = new Set([...liveSignatures.keys()]);

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(entry))) out.push(full);
  }
}

const sourceFiles = [];
for (const d of APP_DIRS) walk(d, sourceFiles);

const rpcCallRe = /\.rpc\(\s*["'`]([a-zA-Z_][\w]*)["'`]/g;
const missing = [];
for (const file of sourceFiles) {
  const code = readFileSync(file, "utf8");
  let m;
  rpcCallRe.lastIndex = 0;
  while ((m = rpcCallRe.exec(code)) !== null) {
    const name = m[1];
    if (!definedNames.has(name)) {
      missing.push(`  - ${name}  (called in ${file})`);
    }
  }
}
if (missing.length > 0) {
  fail([
    "RPC call(s) to function(s) not defined in supabase/migrations:",
    ...missing,
    "",
    "Fix: add a migration defining the function, or correct the RPC name.",
  ]);
}

// ── Rule 3: SQL error codes and the ServiceErrorCode enum must agree ───────────
// Extract the enum's string values from errors.ts as text (this .mjs can't import the .ts).
const enumSource = readFileSync(ERROR_ENUM_FILE, "utf8");
const enumBlockMatch = enumSource.match(/ServiceErrorCode\s*=\s*\{([\s\S]*?)\}\s*as\s+const/);
if (!enumBlockMatch) {
  fail([`Could not locate the \`ServiceErrorCode = { ... } as const\` block in ${ERROR_ENUM_FILE}.`]);
}
const enumCodes = new Set();
for (const m of enumBlockMatch[1].matchAll(/:\s*"([A-Z0-9_]+)"/g)) {
  enumCodes.add(m[1]);
}

// Collect every `raise exception 'CODE'` literal across all migrations.
const raisedCodes = new Set();
for (const file of migrationFiles) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  for (const m of sql.matchAll(/raise\s+exception\s+'([A-Z0-9_]+)'/gi)) {
    raisedCodes.add(m[1].toUpperCase());
  }
}

// 3a. Every enum code must actually be raised in SQL (else a client mapping is dead / misspelled).
const enumWithoutRaise = [...enumCodes].filter((c) => !raisedCodes.has(c)).sort();
// 3b. Every raised, client-facing code must be in the enum (else the client can't map a real error).
const raisedWithoutEnum = [...raisedCodes]
  .filter((c) => !enumCodes.has(c) && !INTERNAL_ONLY_CODES.has(c))
  .sort();

if (enumWithoutRaise.length > 0 || raisedWithoutEnum.length > 0) {
  const lines = ["ServiceErrorCode ↔ SQL `raise exception` mismatch:"];
  if (raisedWithoutEnum.length > 0) {
    lines.push(
      "",
      "  Raised in SQL but missing from ServiceErrorCode (client cannot map these):",
      ...raisedWithoutEnum.map((c) => `    - ${c}`),
      `  Fix: add them to ${ERROR_ENUM_FILE}, or add to INTERNAL_ONLY_CODES if never client-facing.`
    );
  }
  if (enumWithoutRaise.length > 0) {
    lines.push(
      "",
      "  In ServiceErrorCode but never raised in any migration (dead / typo'd mapping):",
      ...enumWithoutRaise.map((c) => `    - ${c}`),
      "  Fix: correct the code, or remove it from the enum if the SQL no longer raises it."
    );
  }
  fail(lines);
}

console.log(
  `Migration check passed: ${liveSignatures.size} functions, no overloads; ` +
    `${sourceFiles.length} source files scanned, all RPC calls resolve; ` +
    `${enumCodes.size} error codes match SQL.`
);
