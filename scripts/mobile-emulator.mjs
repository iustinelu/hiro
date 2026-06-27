#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Hiro mobile QA harness — headless Android emulator driver
//
// Boots a headless, KVM-accelerated Android emulator and drives it for mobile QA:
// feature agents call this to launch the Hiro app on a real Android runtime and
// capture screenshots, instead of relying on unit tests alone.
//
//   node scripts/mobile-emulator.mjs boot              # start AVD headless, wait for boot, adb reverse 8081
//   node scripts/mobile-emulator.mjs status            # is an emulator online + fully booted?
//   node scripts/mobile-emulator.mjs reverse           # (re)set adb reverse tcp:8081 so the app reaches Metro
//   node scripts/mobile-emulator.mjs launch            # launch the installed Hiro app (com.behiro.app)
//   node scripts/mobile-emulator.mjs screenshot <name> # dump PNG to /tmp/hiro-mobile-qa/<name>.png
//   node scripts/mobile-emulator.mjs logcat            # tail RN/Hiro-relevant logcat (Ctrl-C to stop)
//   node scripts/mobile-emulator.mjs kill              # shut the emulator down
//
// All tooling is user-local; this script sets JAVA_HOME / ANDROID_HOME / PATH itself,
// so it works without any shell rc changes. See docs/v0.1.3/mobile-qa-harness.md.
// ─────────────────────────────────────────────────────────────────────────────

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const JAVA_HOME = process.env.JAVA_HOME || join(HOME, ".local/share/jdk/temurin-17");
const ANDROID_HOME =
  process.env.ANDROID_HOME || join(HOME, ".local/share/Android/Sdk");

const PLATFORM_TOOLS = join(ANDROID_HOME, "platform-tools");
const EMULATOR_DIR = join(ANDROID_HOME, "emulator");
const CMDLINE_BIN = join(ANDROID_HOME, "cmdline-tools/latest/bin");

const ADB = join(PLATFORM_TOOLS, "adb");
const EMULATOR = join(EMULATOR_DIR, "emulator");

const AVD_NAME = "hiro_pixel";
// Matches app.json android.package (and the Apple/Play store id). apps/mobile/android
// is a gitignored `expo prebuild` artifact; if a stale local prebuild ever installs a
// different id, regenerate it with `npx expo prebuild --clean -p android`.
const APP_ID = "com.behiro.app";
const METRO_PORT = 8081;
const SHOT_DIR = "/tmp/hiro-mobile-qa";

// Self-contained env so adb/emulator resolve their own deps without shell config.
const ENV = {
  ...process.env,
  JAVA_HOME,
  ANDROID_HOME,
  ANDROID_SDK_ROOT: ANDROID_HOME,
  PATH: `${join(JAVA_HOME, "bin")}:${PLATFORM_TOOLS}:${EMULATOR_DIR}:${CMDLINE_BIN}:${process.env.PATH ?? ""}`,
};

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { env: ENV, encoding: "utf8", ...opts });
}

function adb(args, opts = {}) {
  return sh(ADB, args, opts);
}

function isBooted() {
  const state = adb(["get-state"]);
  if (state.status !== 0 || state.stdout.trim() !== "device") return false;
  const booted = adb(["shell", "getprop", "sys.boot_completed"]);
  return booted.stdout.trim() === "1";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function boot() {
  if (isBooted()) {
    console.log("Emulator already booted.");
    setReverse();
    return;
  }
  mkdirSync(SHOT_DIR, { recursive: true });
  const logPath = join(SHOT_DIR, "emulator.log");
  const out = openSync(logPath, "a");
  console.log(`Booting ${AVD_NAME} headless (log: ${logPath})...`);
  const child = spawn(
    EMULATOR,
    [
      "-avd", AVD_NAME,
      "-no-window", "-no-audio", "-no-boot-anim", "-no-snapshot",
      "-gpu", "swiftshader_indirect",
    ],
    { env: ENV, detached: true, stdio: ["ignore", out, out] },
  );
  child.unref();

  adb(["wait-for-device"]);
  const start = Date.now();
  const timeoutMs = 180_000;
  while (Date.now() - start < timeoutMs) {
    if (isBooted()) {
      console.log(`Boot complete in ${Math.round((Date.now() - start) / 1000)}s.`);
      setReverse();
      return;
    }
    await sleep(2000);
  }
  console.error(`Emulator did not finish booting within ${timeoutMs / 1000}s. See ${logPath}.`);
  process.exit(1);
}

function setReverse() {
  const r = adb(["reverse", `tcp:${METRO_PORT}`, `tcp:${METRO_PORT}`]);
  if (r.status === 0) console.log(`adb reverse tcp:${METRO_PORT} set (app → Metro on localhost).`);
  else console.error(`adb reverse failed:\n${r.stderr}`);
}

function status() {
  if (isBooted()) {
    const rel = adb(["shell", "getprop", "ro.build.version.release"]).stdout.trim();
    console.log(`Emulator ONLINE and booted (Android ${rel}).`);
  } else {
    console.log("No booted emulator.");
    process.exit(1);
  }
}

function launch() {
  if (!isBooted()) {
    console.error("No booted emulator — run `boot` first.");
    process.exit(1);
  }
  const r = adb([
    "shell", "monkey", "-p", APP_ID,
    "-c", "android.intent.category.LAUNCHER", "1",
  ]);
  if (r.status === 0) console.log(`Launched ${APP_ID}.`);
  else {
    console.error(`Launch failed — is the app installed? (run \`expo run:android\` once).\n${r.stderr}`);
    process.exit(1);
  }
}

function screenshot(name) {
  if (!name) {
    console.error("Usage: screenshot <name>");
    process.exit(1);
  }
  if (!isBooted()) {
    console.error("No booted emulator — run `boot` first.");
    process.exit(1);
  }
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = join(SHOT_DIR, `${name}.png`);
  const out = openSync(path, "w");
  const r = sh(ADB, ["exec-out", "screencap", "-p"], { stdio: ["ignore", out, "pipe"] });
  if (r.status === 0) console.log(`Screenshot saved: ${path}`);
  else {
    console.error(`Screenshot failed:\n${r.stderr}`);
    process.exit(1);
  }
}

function logcat() {
  if (!isBooted()) {
    console.error("No booted emulator — run `boot` first.");
    process.exit(1);
  }
  adb(["logcat", "-c"]);
  // ReactNative/ReactNativeJS for JS errors; AndroidRuntime for native crashes.
  const child = spawn(
    ADB,
    ["logcat", "ReactNative:V", "ReactNativeJS:V", "AndroidRuntime:E", "*:S"],
    { env: ENV, stdio: "inherit" },
  );
  child.on("exit", (code) => process.exit(code ?? 0));
}

function kill() {
  const r = adb(["emu", "kill"]);
  if (r.status === 0) console.log("Emulator shutting down.");
  else console.log("No emulator to kill (or already down).");
}

const [cmd, arg] = process.argv.slice(2);
switch (cmd) {
  case "boot": await boot(); break;
  case "status": status(); break;
  case "reverse": setReverse(); break;
  case "launch": launch(); break;
  case "screenshot": screenshot(arg); break;
  case "logcat": logcat(); break;
  case "kill": kill(); break;
  default:
    console.log("Usage: node scripts/mobile-emulator.mjs <boot|status|reverse|launch|screenshot <name>|logcat|kill>");
    process.exit(cmd ? 1 : 0);
}
