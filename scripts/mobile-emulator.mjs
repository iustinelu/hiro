#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Hiro mobile QA harness — headless Android emulator pool
//
// Boots headless, KVM-accelerated Android emulators so feature agents can launch
// the Hiro app on a real Android runtime, drive a flow, and screenshot it.
//
// Supports PARALLEL QA via a slot pool. Each slot is an independent emulator with
// its own AVD, adb serial, and Metro port. Agents claim the next free slot with
// `acquire` (no coordination needed) and drop it with `release`.
//
//   node scripts/mobile-emulator.mjs acquire             # claim next free slot, boot it, print its env
//   node scripts/mobile-emulator.mjs list                # show every slot: free / busy / booted
//   node scripts/mobile-emulator.mjs release --slot N    # give a slot back (emulator stays warm)
//
//   node scripts/mobile-emulator.mjs launch     --slot N # launch the installed app
//   node scripts/mobile-emulator.mjs screenshot <name> --slot N   # -> /tmp/hiro-mobile-qa/<name>.png
//   node scripts/mobile-emulator.mjs logcat     --slot N # tail RN/JS + native-crash logcat
//   node scripts/mobile-emulator.mjs status     --slot N
//   node scripts/mobile-emulator.mjs point      --slot N # (re)point app at its slot's Metro
//   node scripts/mobile-emulator.mjs boot       --slot N # boot without claiming a lease
//   node scripts/mobile-emulator.mjs provision  --slot N # create AVD + boot + install APK
//   node scripts/mobile-emulator.mjs kill       --slot N # shut one emulator down (also releases lease)
//   node scripts/mobile-emulator.mjs kill-all            # shut every emulator down
//
// Typical agent flow (parallel-safe):
//   eval "$(node scripts/mobile-emulator.mjs acquire)"   # exports HIRO_QA_SLOT / _SERIAL / _METRO_PORT
//   npx expo start --port "$HIRO_QA_METRO_PORT"          # Metro from THIS worktree on the slot's port
//   node scripts/mobile-emulator.mjs launch --slot "$HIRO_QA_SLOT"
//   ... drive + screenshot ...
//   node scripts/mobile-emulator.mjs release --slot "$HIRO_QA_SLOT"
//
// Self-contained: sets its own JAVA_HOME/ANDROID_HOME/PATH, so it works without
// any shell rc changes. See docs/v0.1.3/mobile-qa-harness.md.
// ─────────────────────────────────────────────────────────────────────────────

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, openSync, closeSync, writeSync, writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOME = homedir();
const JAVA_HOME = process.env.JAVA_HOME || join(HOME, ".local/share/jdk/temurin-17");
const ANDROID_HOME = process.env.ANDROID_HOME || join(HOME, ".local/share/Android/Sdk");

const PLATFORM_TOOLS = join(ANDROID_HOME, "platform-tools");
const EMULATOR_DIR = join(ANDROID_HOME, "emulator");
const CMDLINE_BIN = join(ANDROID_HOME, "cmdline-tools/latest/bin");
const ADB = join(PLATFORM_TOOLS, "adb");
const EMULATOR = join(EMULATOR_DIR, "emulator");
const AVDMANAGER = join(CMDLINE_BIN, "avdmanager");

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const APK = join(REPO_ROOT, "apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk");

const APP_ID = "com.behiro.app"; // matches app.json android.package + the Apple/Play id
const SYSTEM_IMAGE = "system-images;android-34;google_apis;x86_64";
const DEVICE_PROFILE = "pixel_6";

const MAX_SLOTS = Number(process.env.HIRO_QA_MAX_SLOTS || 4);
const BASE_CONSOLE_PORT = 5554; // emulator consoles use even ports; serial = emulator-<port>
const BASE_METRO_PORT = 8081; // each slot's Metro runs on its own host port
const EMU_HOST_ALIAS = "10.0.2.2"; // from inside an emulator this is the host's loopback

const SHOT_DIR = "/tmp/hiro-mobile-qa";
const SLOT_DIR = join(SHOT_DIR, "slots");
const LEASE_TTL_MS = 3 * 60 * 60 * 1000; // a lease older than this is treated as abandoned

// Self-contained env so adb/emulator resolve their own deps without shell config.
const ENV = {
  ...process.env,
  JAVA_HOME,
  ANDROID_HOME,
  ANDROID_SDK_ROOT: ANDROID_HOME,
  PATH: [join(JAVA_HOME, "bin"), PLATFORM_TOOLS, EMULATOR_DIR, CMDLINE_BIN, process.env.PATH || ""].join(":"),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slotInfo(n) {
  const consolePort = BASE_CONSOLE_PORT + (n - 1) * 2;
  return {
    slot: n,
    consolePort,
    serial: `emulator-${consolePort}`,
    avd: n === 1 ? "hiro_pixel" : `hiro_pixel_${n}`,
    metroPort: BASE_METRO_PORT + (n - 1),
  };
}

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { env: ENV, encoding: "utf8", ...opts });
}
function adb(serial, args, opts = {}) {
  return sh(ADB, ["-s", serial, ...args], opts);
}

function avdExists(name) {
  const r = sh(EMULATOR, ["-list-avds"]);
  return (r.stdout || "").split("\n").map((s) => s.trim()).includes(name);
}

function isBooted(serial) {
  const state = adb(serial, ["get-state"]);
  if (state.status !== 0 || (state.stdout || "").trim() !== "device") return false;
  return (adb(serial, ["shell", "getprop", "sys.boot_completed"]).stdout || "").trim() === "1";
}

function appInstalled(serial) {
  const r = adb(serial, ["shell", "pm", "list", "packages", APP_ID]);
  return (r.stdout || "").includes(APP_ID);
}

// ── lease bookkeeping ────────────────────────────────────────────────────────
const lockPath = (n) => join(SLOT_DIR, `slot-${n}.json`);

function readLease(n) {
  try {
    return JSON.parse(readFileSync(lockPath(n), "utf8"));
  } catch {
    return null;
  }
}
function leaseActive(n) {
  const l = readLease(n);
  if (!l) return false;
  if (Date.now() - (l.acquiredAt || 0) > LEASE_TTL_MS) return false; // stale → reclaimable
  return true;
}
function writeLease(n, owner) {
  const info = slotInfo(n);
  const data = JSON.stringify({ ...info, owner: owner || "unknown", pid: process.pid, acquiredAt: Date.now() });
  const fd = openSync(lockPath(n), "wx"); // atomic: throws EEXIST if already claimed
  writeSync(fd, data);
  closeSync(fd);
}
function tryClaim(n, owner) {
  try {
    writeLease(n, owner);
    return true;
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
    if (!leaseActive(n)) {
      // stale lease — reclaim
      try { unlinkSync(lockPath(n)); } catch {}
      try { writeLease(n, owner); return true; } catch { return false; }
    }
    return false;
  }
}

// ── provisioning / boot ──────────────────────────────────────────────────────
function createAvd(n) {
  const { avd } = slotInfo(n);
  if (avdExists(avd)) return;
  log(`Creating AVD ${avd} (${DEVICE_PROFILE})...`);
  const r = sh(AVDMANAGER, ["create", "avd", "-n", avd, "-k", SYSTEM_IMAGE, "-d", DEVICE_PROFILE, "--force"], {
    input: "no\n",
  });
  if (r.status !== 0) {
    console.error(`Failed to create AVD ${avd}:\n${r.stderr}`);
    process.exit(1);
  }
}

async function bootSlot(n) {
  const { avd, serial, consolePort, metroPort } = slotInfo(n);
  if (isBooted(serial)) return;
  createAvd(n);
  mkdirSync(SHOT_DIR, { recursive: true });
  const out = openSync(join(SHOT_DIR, `emulator-slot${n}.log`), "a");
  log(`Booting slot ${n} (${avd}) headless on console ${consolePort}...`);
  const child = spawn(
    EMULATOR,
    ["-avd", avd, "-port", String(consolePort),
     "-no-window", "-no-audio", "-no-boot-anim", "-no-snapshot",
     "-gpu", "swiftshader_indirect"],
    { env: ENV, detached: true, stdio: ["ignore", out, out] },
  );
  child.unref();

  adb(serial, ["wait-for-device"]);
  const start = Date.now();
  while (Date.now() - start < 180_000) {
    if (isBooted(serial)) {
      log(`Slot ${n} booted in ${Math.round((Date.now() - start) / 1000)}s (serial ${serial}, Metro port ${metroPort}).`);
      return;
    }
    await sleep(2000);
  }
  console.error(`Slot ${n} did not finish booting within 180s. See ${join(SHOT_DIR, `emulator-slot${n}.log`)}.`);
  process.exit(1);
}

// Point this slot's app at its OWN Metro. A RN debug app on an emulator dials the
// host directly via 10.0.2.2 and ignores `adb reverse`, so per-slot isolation comes
// from RN's `debug_http_host` preference: each app talks to 10.0.2.2:<its metro port>.
// Requires the app installed (debuggable, so `run-as` works) and is re-asserted on launch.
function setDevServer(n) {
  const { serial, metroPort } = slotInfo(n);
  if (!appInstalled(serial)) return;
  const host = `${EMU_HOST_ALIAS}:${metroPort}`;
  const xml = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n<map>\n    <string name="debug_http_host">${host}</string>\n</map>\n`;
  mkdirSync(SHOT_DIR, { recursive: true });
  const localPath = join(SHOT_DIR, `rnprefs-slot${n}.xml`);
  writeFileSync(localPath, xml);
  const devTmp = `/data/local/tmp/rnprefs-slot${n}.xml`;
  adb(serial, ["push", localPath, devTmp]);
  const prefs = `${APP_ID}_preferences.xml`;
  const r = adb(serial, ["shell", `run-as ${APP_ID} sh -c 'mkdir -p shared_prefs && cp ${devTmp} shared_prefs/${prefs}'`]);
  if (r.status === 0) log(`Slot ${n}: app dev server → ${host} (Metro port ${metroPort}).`);
  else console.error(`Slot ${n}: failed to set dev server host:\n${r.stderr}`);
}

function ensureApk(n) {
  const { serial } = slotInfo(n);
  if (appInstalled(serial)) return;
  if (!existsSync(APK)) {
    console.error(`App not installed on slot ${n} and no prebuilt APK at:\n  ${APK}\nRun \`cd apps/mobile && npx expo run:android\` once to build it.`);
    process.exit(1);
  }
  log(`Installing ${APP_ID} on slot ${n}...`);
  const r = adb(serial, ["install", "-r", APK]);
  if (r.status !== 0) {
    console.error(`Install failed on slot ${n}:\n${r.stderr}`);
    process.exit(1);
  }
}

// ── commands ─────────────────────────────────────────────────────────────────
function log(msg) {
  console.error(msg); // human/log output on stderr so stdout stays machine-parseable for `acquire`
}

function printSlotEnv(n) {
  const { slot, serial, metroPort, avd } = slotInfo(n);
  // stdout only: `eval "$(... acquire)"` consumes these
  console.log(`HIRO_QA_SLOT=${slot}`);
  console.log(`HIRO_QA_SERIAL=${serial}`);
  console.log(`HIRO_QA_METRO_PORT=${metroPort}`);
  console.log(`HIRO_QA_AVD=${avd}`);
}

async function acquire(owner) {
  mkdirSync(SLOT_DIR, { recursive: true });
  for (let n = 1; n <= MAX_SLOTS; n++) {
    if (!tryClaim(n, owner)) continue;
    log(`Acquired slot ${n}` + (owner ? ` for "${owner}"` : "") + ".");
    await bootSlot(n);
    ensureApk(n);
    setDevServer(n);
    log(`Slot ${n} ready. Start Metro:  npx expo start --port ${slotInfo(n).metroPort}`);
    printSlotEnv(n);
    return;
  }
  console.error(`All ${MAX_SLOTS} QA slots are busy. Run \`list\` to see who holds them, or raise HIRO_QA_MAX_SLOTS.`);
  process.exit(1);
}

function release(n, owner, kill) {
  const l = readLease(n);
  if (l && owner && l.owner && l.owner !== owner) {
    log(`Warning: slot ${n} was held by "${l.owner}", releasing anyway.`);
  }
  try { unlinkSync(lockPath(n)); log(`Released slot ${n}.`); }
  catch { log(`Slot ${n} had no active lease.`); }
  if (kill) killSlot(n);
  else log(`Emulator left running (warm). Use \`kill --slot ${n}\` to shut it down.`);
}

function killSlot(n) {
  const { serial } = slotInfo(n);
  const r = adb(serial, ["emu", "kill"]);
  if (r.status === 0) log(`Slot ${n} (${serial}) shutting down.`);
  else log(`Slot ${n} not running.`);
}

function killAll() {
  for (let n = 1; n <= MAX_SLOTS; n++) if (isBooted(slotInfo(n).serial)) killSlot(n);
}

function list() {
  log(`QA slot pool (max ${MAX_SLOTS}). App: ${APP_ID}`);
  const rows = [];
  for (let n = 1; n <= MAX_SLOTS; n++) {
    const { serial, avd, metroPort } = slotInfo(n);
    const booted = isBooted(serial);
    const lease = readLease(n);
    let held = "free";
    if (lease) {
      const ageMin = Math.round((Date.now() - (lease.acquiredAt || 0)) / 60000);
      const stale = !leaseActive(n);
      held = stale ? `STALE(${lease.owner})` : `busy: ${lease.owner} (${ageMin}m)`;
    }
    rows.push({ slot: n, avd: avdExists(avd) ? "yes" : "no", booted: booted ? "up" : "-", metro: metroPort, lease: held });
  }
  const w = (s, n) => String(s).padEnd(n);
  console.log(`${w("SLOT", 5)}${w("AVD", 5)}${w("BOOTED", 8)}${w("METRO", 7)}LEASE`);
  for (const r of rows) console.log(`${w(r.slot, 5)}${w(r.avd, 5)}${w(r.booted, 8)}${w(r.metro, 7)}${r.lease}`);
}

function screenshot(n, name) {
  if (!name) { console.error("Usage: screenshot <name> --slot N"); process.exit(1); }
  const { serial } = slotInfo(n);
  if (!isBooted(serial)) { console.error(`Slot ${n} not booted.`); process.exit(1); }
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = join(SHOT_DIR, `${name}.png`);
  const out = openSync(path, "w");
  const r = sh(ADB, ["-s", serial, "exec-out", "screencap", "-p"], { stdio: ["ignore", out, "pipe"] });
  if (r.status === 0) console.log(`Screenshot saved: ${path}`);
  else { console.error(`Screenshot failed:\n${r.stderr}`); process.exit(1); }
}

function launch(n) {
  const { serial } = slotInfo(n);
  if (!isBooted(serial)) { console.error(`Slot ${n} not booted — run \`boot --slot ${n}\` or \`acquire\`.`); process.exit(1); }
  // Re-assert the dev-server pref each launch (force-stop first so RN reads it fresh).
  adb(serial, ["shell", "am", "force-stop", APP_ID]);
  setDevServer(n);
  const r = adb(serial, ["shell", "monkey", "-p", APP_ID, "-c", "android.intent.category.LAUNCHER", "1"]);
  if (r.status === 0) console.log(`Launched ${APP_ID} on slot ${n}.`);
  else { console.error(`Launch failed on slot ${n} — is the app installed?\n${r.stderr}`); process.exit(1); }
}

function status(n) {
  const { serial } = slotInfo(n);
  if (isBooted(serial)) {
    const rel = (adb(serial, ["shell", "getprop", "ro.build.version.release"]).stdout || "").trim();
    console.log(`Slot ${n} (${serial}) ONLINE and booted (Android ${rel}).`);
  } else { console.log(`Slot ${n} (${serial}) not booted.`); process.exit(1); }
}

function logcat(n) {
  const { serial } = slotInfo(n);
  if (!isBooted(serial)) { console.error(`Slot ${n} not booted.`); process.exit(1); }
  adb(serial, ["logcat", "-c"]);
  const child = spawn(ADB, ["-s", serial, "logcat", "ReactNative:V", "ReactNativeJS:V", "AndroidRuntime:E", "*:S"],
    { env: ENV, stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
}

// ── arg parsing ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];
const positionals = argv.slice(1).filter((a) => !a.startsWith("--"));
function flag(name) { return argv.includes(`--${name}`); }
function opt(name, def) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
}
const slot = Number(opt("slot", 1));
const owner = opt("owner", process.env.HIRO_QA_OWNER || "");

if ((slot < 1 || slot > MAX_SLOTS) && ["boot", "provision", "launch", "screenshot", "status", "reverse", "logcat", "kill", "release"].includes(cmd)) {
  console.error(`--slot must be 1..${MAX_SLOTS}`);
  process.exit(1);
}

switch (cmd) {
  case "acquire": await acquire(owner); break;
  case "release": release(slot, owner, flag("kill")); break;
  case "list": case "slots": list(); break;
  case "boot": await bootSlot(slot); break;
  case "provision": await bootSlot(slot); ensureApk(slot); setDevServer(slot); log(`Slot ${slot} provisioned.`); break;
  case "launch": launch(slot); break;
  case "screenshot": screenshot(slot, positionals[0]); break;
  case "status": status(slot); break;
  case "point": case "reverse": setDevServer(slot); break;
  case "logcat": logcat(slot); break;
  case "kill": killSlot(slot); try { unlinkSync(lockPath(slot)); } catch {} break;
  case "kill-all": killAll(); break;
  default:
    console.log("Usage: node scripts/mobile-emulator.mjs <acquire|release|list|boot|provision|launch|screenshot <name>|status|point|logcat|kill|kill-all> [--slot N] [--owner X] [--kill]");
    process.exit(cmd ? 1 : 0);
}
