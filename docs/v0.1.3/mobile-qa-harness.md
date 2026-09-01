# Mobile QA harness (Android emulator)

> **STATUS: BROKEN (as of 2026-06-27).** A node_modules SDK-54 version skew makes the emulator app crash with an EventEmitter red screen on launch.
> Until the harness is repaired, QA runs on the **physical Pixel over USB** (`46221FDAS00412`) - see `docs/next-chat-handoff.md`.
> Gotcha that still applies there: only ONE Metro on port 8081, and it must be the active worktree's, or the device loads the wrong bundle.

This is the reusable harness v0.1.3 build agents use to **self-verify mobile work on a real Android runtime** - boot a headless emulator, launch the Hiro app, drive a flow, capture a screenshot - instead of relying on unit tests alone.

Set up once (see [Install recap](#install-recap)); every later agent just runs the [per-branch QA recipe](#per-branch-qa-recipe).

Proof it works: ![Home screen rendering the theme](assets/mobile-qa-home-proof.png)
*(Hiro Home screen, themed, captured headless on the emulator via `node scripts/mobile-emulator.mjs screenshot home`.)*

---

## Parallel QA: the slot pool

The harness runs a **pool of independent emulators**, so multiple agents can QA at the same time without coordinating. Each *slot* is one emulator with its own AVD, adb serial, and **Metro port**:

| Slot | AVD | Serial | Metro port |
|---|---|---|---|
| 1 | `hiro_pixel` | `emulator-5554` | 8081 |
| 2 | `hiro_pixel_2` | `emulator-5556` | 8082 |
| 3 | `hiro_pixel_3` | `emulator-5558` | 8083 |
| 4 | `hiro_pixel_4` | `emulator-5560` | 8084 |

An agent **claims the next free slot with `acquire`** (atomic lease - no two agents get the same one) and **`release`s** it when done. `acquire` **self-provisions on demand**: if a slot's AVD doesn't exist yet, it creates it, boots it, installs the app, and points it at its Metro - so agents never need to be told which slot to use, and the pool grows itself up to `HIRO_QA_MAX_SLOTS` (default **4**; raise it if the box has headroom - each emulator is ~2-4 GB RAM + ~1.9 GB disk).

> Per-slot routing works because each app is pointed at `10.0.2.2:<its Metro port>` via RN's `debug_http_host` preference (a plain `adb reverse` does **not** isolate RN emulators - they dial the host directly). The helper sets this automatically on `acquire`/`launch`.

## Prerequisites (read first)
- **Node:** use the repo's Node (v22 via nvm - the default in a normal shell). Don't run the helper under a stripped `PATH` (the system `/usr/bin/node` is ancient v12 and will fail to parse the script).
- **Source the env for builds:** the `.mjs` helper self-contains its env, but `npx expo run:android` / raw `adb` / `emulator` need `source scripts/android-env.sh` first.
- **Rebuild only on native changes.** The `com.behiro.app` debug APK is already installed on every slot's AVD and persists. A JS/TS change needs only a Metro restart. Adding/removing a native module (`expo-*` / `react-native-*`) or changing `app.json` native config needs `npx expo run:android` again (~3-4 min) - and possibly `expo prebuild --clean`. (After a native rebuild, reinstall the new APK on other slots with `adb -s <serial> install -r <apk>`, or just `kill` them so the next `acquire` reinstalls.)
- **If Metro complains about a missing dep** (`"<pkg>" is added as a dependency ... but it doesn't seem to be installed`), run `npm install` from the repo root first.

## TL;DR for a feature agent (parallel-safe)

```bash
source scripts/android-env.sh                          # JAVA_HOME / ANDROID_HOME / PATH (user-local, no sudo)
eval "$(node scripts/mobile-emulator.mjs acquire)"     # claim+boot next free slot; exports HIRO_QA_SLOT / _SERIAL / _METRO_PORT
npx expo start --port "$HIRO_QA_METRO_PORT"            # Metro from THIS worktree on the slot's port (loads .env)
node scripts/mobile-emulator.mjs launch --slot "$HIRO_QA_SLOT"
# ... drive the flow (see "Driving the UI") ...
node scripts/mobile-emulator.mjs screenshot my-check --slot "$HIRO_QA_SLOT"   # -> /tmp/hiro-mobile-qa/my-check.png
node scripts/mobile-emulator.mjs release --slot "$HIRO_QA_SLOT"               # give the slot back
```

`node scripts/mobile-emulator.mjs list` shows every slot (free / busy / booted) at a glance. The debug APK is **built once** and reused across branches/slots; switching branches only needs a Metro restart (JS is served live), not a rebuild.

---

## Helper script: `scripts/mobile-emulator.mjs`

Self-contained (sets its own `JAVA_HOME`/`ANDROID_HOME`/`PATH`). Every per-slot command takes `--slot N` (default 1).

| Command | What it does |
|---|---|
| `acquire` | Claims the next free slot (atomic lease), boots it, installs the app, points it at its Metro, prints `HIRO_QA_*` env on stdout. Self-provisions a new slot if needed (up to `HIRO_QA_MAX_SLOTS`). |
| `release --slot N` | Drops the lease (emulator left warm; add `--kill` to shut it down). |
| `list` | Table of all slots: AVD exists, booted, Metro port, lease holder + age. |
| `boot --slot N` | Boots a slot without claiming a lease. No-op if already booted. |
| `provision --slot N` | Create AVD + boot + install app + point at Metro (no lease). |
| `launch --slot N` | Force-stops, re-points at the slot's Metro, then launches `com.behiro.app`. |
| `screenshot <name> --slot N` | Writes `/tmp/hiro-mobile-qa/<name>.png` from that slot. |
| `status --slot N` | Whether that slot is online + booted (exit 1 if not). |
| `point --slot N` | Re-assert the `debug_http_host` pref → the slot's Metro. |
| `logcat --slot N` | Tails RN/JS + native-crash logcat (Ctrl-C to stop). Use to debug a blank screen. |
| `kill --slot N` / `kill-all` | Shut one / all emulators down. |

Leases live in `/tmp/hiro-mobile-qa/slots/` and auto-expire after 3 h (a crashed agent's slot becomes reclaimable). `scripts/android-env.sh` exports the same env for interactive `expo run:android` / `adb` / `emulator` use. **No `~/.zshrc` changes were made** - everything is explicit and repo-local.

---

## Install recap (done once on this box, user-local, no sudo)

Everything lives under `~/.local/share`; the only pre-existing system bits were `/usr/bin/adb` (overridden by the SDK's newer `adb` via PATH) and `/dev/kvm`.

| Component | Version (pinned) | Location |
|---|---|---|
| JDK | **Temurin OpenJDK 17.0.19+10** | `~/.local/share/jdk/temurin-17` |
| Android cmdline-tools | **build 13114758** (sdkmanager 19.0) | `$ANDROID_HOME/cmdline-tools/latest` |
| platform-tools (adb) | **37.0.0** | `$ANDROID_HOME/platform-tools` |
| Android Emulator | **36.6.11** | `$ANDROID_HOME/emulator` |
| Platform | **android-34** (rev 3) | `$ANDROID_HOME/platforms/android-34` |
| System image | **system-images;android-34;google_apis;x86_64** (rev 14) | `$ANDROID_HOME/system-images/...` |
| AVD | `hiro_pixel` (pixel_6 profile, x86_64) | `~/.android/avd/hiro_pixel.avd` |

`ANDROID_HOME=/home/iustin/.local/share/Android/Sdk`.

**Auto-installed by the first Gradle build** (the native project compiles against API 36 + native libs): build-tools `35.0.0` + `36.0.0`, platform `android-36`, NDK `27.1.12297006`, CMake `3.22.1`. Expect these on a clean re-setup.

### Reproduce from scratch
```bash
# 1. JDK
mkdir -p ~/.local/share/jdk && cd ~/.local/share/jdk
curl -fL -o j.tgz "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"
tar xzf j.tgz && mv jdk-17* temurin-17 && rm j.tgz

# 2. Android cmdline-tools
export ANDROID_HOME=~/.local/share/Android/Sdk
mkdir -p "$ANDROID_HOME/cmdline-tools" && cd "$ANDROID_HOME/cmdline-tools"
curl -fL -o c.zip "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip"
unzip -q c.zip && mv cmdline-tools latest && rm c.zip

# 3. SDK packages
source <repo>/scripts/android-env.sh
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;x86_64" "emulator"

# 4. AVD
avdmanager create avd -n hiro_pixel -k "system-images;android-34;google_apis;x86_64" -d pixel_6
```

### Cost (measured on this box: 24 cores, 62 GB RAM, /dev/kvm present)
- **KVM hardware accel: works** (`KVM (version 12) is installed and usable`). The user is already in the `kvm` group. If a future box can't open `/dev/kvm`, add the user to the `kvm` group and relog.
- **Boot time:** ~26s cold, ~8s warm (KVM-accelerated, headless).
- **First `expo run:android` build:** ~3m28s Gradle + install (one-time; subsequent JS-only changes need no rebuild).
- **Disk:** JDK ~0.32 GB; Android SDK ~7.8 GB after the first build (incl. NDK/CMake/build-tools/android-36 pulled in by Gradle). Budget ~9 GB total.

---

## App-delivery path (the decision)

**Chosen: a local debug build via `expo run:android`, JS served per-slot by its own Metro, the APK reused across branches and slots.**

- `cd apps/mobile && npx expo run:android` compiles the native project (`apps/mobile/android/`, a local prebuild artifact) to a debug APK and installs it. The APK is built **once** and reused; `acquire` installs that prebuilt APK onto each new slot's AVD - no per-slot rebuild. Feature branches only restart Metro.
- This debug build is a **real dev build with the app's native code baked in** - NOT Expo Go. That matters for **F3 (push notifications)**: `expo-notifications` native config cannot run under Expo Go, but it runs fine in this build. (`expo-dev-client` is not currently a dependency; the plain debug build still hosts native modules and connects to Metro, which is all the harness needs.)
- **Each slot's app reaches its own Metro** by pointing RN's `debug_http_host` at `10.0.2.2:<slot Metro port>` (the helper sets this on `acquire`/`launch`). `adb reverse` is **not** used - RN debug apps on an emulator dial the host directly, so reverse can't isolate them.

### Package id: `com.behiro.app`
`apps/mobile/android/` is **gitignored** - it's a local `expo prebuild` artifact, not committed. The id source of truth is `app.json` (`android.package` and `ios.bundleIdentifier`), both **`com.behiro.app`** - the same id used in the Apple App Store and Google Play. The harness targets `com.behiro.app`.

If a stale local prebuild ever installs the app under a different id, regenerate the native dir from `app.json`:
```bash
cd apps/mobile && npx expo prebuild --clean -p android
```
(A previous local prebuild had drifted to `com.hiro.app`; `prebuild --clean` realigned it.)

---

## Per-branch QA recipe

For QAing a feature branch in an isolated worktree (the standard per-item dispatch flow). Multiple agents can run this **at the same time** - each claims its own slot:

```bash
H=/home/iustin/dev/hiro    # the harness script + env live in the main checkout; work from anywhere

# 1. Worktree + its gitignored env (see project memory: worktree_env_files)
git worktree add ../hiro-<branch> <branch>
cp $H/apps/mobile/.env ../hiro-<branch>/apps/mobile/.env

# 2. Claim a slot (auto-boots + self-provisions if needed). Exports HIRO_QA_SLOT / _SERIAL / _METRO_PORT.
source $H/scripts/android-env.sh
eval "$(node $H/scripts/mobile-emulator.mjs acquire --owner <branch>)"

# 3. Metro from the WORKTREE on the slot's port (restart so EXPO_PUBLIC_* reload)
cd ../hiro-<branch> && npx expo start --port "$HIRO_QA_METRO_PORT"

# 4. Launch + drive + screenshot (all targeting this slot)
node $H/scripts/mobile-emulator.mjs launch --slot "$HIRO_QA_SLOT"
#   reload JS after a change: press 'r' in the Metro terminal.
node $H/scripts/mobile-emulator.mjs screenshot <branch>-<flow> --slot "$HIRO_QA_SLOT"

# 5. Done - hand the slot back
node $H/scripts/mobile-emulator.mjs release --slot "$HIRO_QA_SLOT"
```

If the app shows a **blank/black screen**, it's almost always a missing `.env` in the worktree (env validation throws at module load before render). Run `node $H/scripts/mobile-emulator.mjs logcat --slot "$HIRO_QA_SLOT"` and look for `validateRuntimeEnv` / `SES_UNCAUGHT_EXCEPTION`. Fix: copy `.env`, restart Metro (steps 1 & 3).

### Reaching gated screens (auth + onboarding)
Home/Tasks/etc. are behind auth **and** onboarding (a user is "onboarded" only with a household membership **and** a non-empty display name - see `RootNavigator.tsx`). To land on Home:

1. Use the canonical QA account: **`apple@test.com` / `Pass4Apple!`** (pre-seeded, onboarded - "Alex Dogfood" / "The Dogfood House").
2. If you need a different account, (re)set a password via Supabase admin (no email round-trip), using the Supabase MCP `execute_sql` on project `pfokfopwjrahclmseper`:
   ```sql
   update auth.users
   set encrypted_password = crypt('<password>', gen_salt('bf')),
       email_confirmed_at = coalesce(email_confirmed_at, now())
   where email = '<account>';
   ```
3. Sign in through the UI; the session persists in SecureStore, so later `launch` calls re-land on Home directly. (SecureStore is per-package-id, so a freshly-installed new package id starts logged out.)

### Driving the UI from the shell
`adb shell input tap/text` works, but **fixed coordinates break when the keyboard opens** (the layout shifts). The reliable pattern is to read live element bounds:

```bash
adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml
# parse <node ... bounds="[x1,y1][x2,y2]"> for the target, tap its center
adb shell input tap <cx> <cy>
adb shell input text "..."          # type into the focused field
adb shell input tap 114 2324        # the keyboard-dismiss chevron (bottom-left) - do NOT use KEYCODE_BACK
```
`KEYCODE_BACK` at the auth root **exits the app** - use the keyboard-dismiss chevron or tap a neutral area instead.

---

## Files
- `scripts/mobile-emulator.mjs` - the harness driver
- `scripts/android-env.sh` - sourceable env for manual SDK/Gradle use
- `docs/v0.1.3/assets/mobile-qa-home-proof.png` - proof screenshot (themed Home, captured headless)
