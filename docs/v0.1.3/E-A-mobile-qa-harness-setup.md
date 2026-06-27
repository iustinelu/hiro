# E-A: Android emulator + mobile QA harness (run in a dedicated session)

## Why this exists
v0.1.3 build agents must self-verify their mobile work by actually launching the app, driving a flow, and capturing a screenshot - not just unit tests.
This box has no usable Android toolchain yet, so this task installs it once and produces a **reusable harness** every later agent calls.
This is install-heavy and noisy, so it runs in its own session to protect the orchestrator's context.

## Verified environment (already probed - do not re-discover)
- OS: Linux, zsh. 24 cores, 62 GB RAM.
- `/dev/kvm` is **present** (perms `crw-rw----`) -> hardware acceleration is available. Confirm the user is in the `kvm` group; if the emulator can't open `/dev/kvm`, that group membership (or a relogin) is the fix.
- `adb` is installed at `/usr/bin/adb`.
- `ANDROID_HOME=/home/iustin/.local/share/Android/Sdk` is exported, but the directory's SDK tooling is **missing**.
- **MISSING and must be installed:** a JDK (`java` not found), `sdkmanager`, `avdmanager`, `emulator`, Android system image.

## Goal / definition of done
1. A working headless Android emulator (AVD) that boots on this box.
2. A documented, reusable harness: `docs/v0.1.3/mobile-qa-harness.md` + a helper script `scripts/mobile-emulator.mjs` (or `.sh`) that can:
   - boot the AVD headless (`-no-window`),
   - wait for boot completion,
   - install + launch the Hiro app,
   - dump a screenshot to a known path (e.g. `/tmp/hiro-mobile-qa/<name>.png`).
3. A proof screenshot of the Hiro **Home** screen rendering a theme correctly.
4. The harness doc tells a feature agent exactly how to QA a worktree branch (boot -> point Metro at the worktree -> launch -> screenshot).

## Suggested path (adapt as needed)
1. **JDK:** install OpenJDK 17 (Temurin/`openjdk-17-jdk`). If you have sudo, use apt; otherwise use a user-local tarball or SDKMAN. Export `JAVA_HOME`.
2. **Android cmdline-tools:** download the Linux "command line tools" zip, unzip to `$ANDROID_HOME/cmdline-tools/latest/`, add `cmdline-tools/latest/bin`, `platform-tools`, and `emulator` to PATH.
3. **SDK packages:** `sdkmanager "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;x86_64" "emulator"` (accept licenses).
4. **AVD:** `avdmanager create avd -n hiro_pixel -k "system-images;android-34;google_apis;x86_64" -d pixel_6`.
5. **Boot headless:** `emulator -avd hiro_pixel -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect &` then `adb wait-for-device` + poll `getprop sys.boot_completed`.
6. **App delivery decision (document the choice):**
   - For most feature QA, run **Metro** from the target worktree (`npm run dev:mobile`) and load the app via a **dev client**.
   - Build the dev client once: `cd apps/mobile && npx expo run:android` (compiles + installs a debug build on the running emulator) OR an EAS `development` profile build. Reuse that APK across branches; feature branches only need a Metro restart.
   - **Caveat for F3 (push notifications):** Expo Go cannot host `expo-notifications` native config - a dev client / dev build is required. The harness must use a dev build, not Expo Go.
   - Worktrees lack gitignored env: copy `apps/mobile/.env` from the main checkout into the worktree and restart Metro so `EXPO_PUBLIC_*` load (see project memory `worktree_env_files`).
7. **Screenshot helper:** `adb exec-out screencap -p > /tmp/hiro-mobile-qa/home.png`.

## Constraints
- Keep everything user-local where possible; record any `sudo`/system changes in the harness doc so they're reproducible.
- Pin versions you install (JDK, cmdline-tools, system image) in the doc.
- Note real wall-clock + disk cost so future agents know what to expect.

## Deliverables to commit (docs direct to main is pre-authorized)
- `docs/v0.1.3/mobile-qa-harness.md` (setup recap + the exact commands a feature agent runs to QA a branch)
- `scripts/mobile-emulator.mjs` (or `.sh`) helper
- The proof screenshot path referenced in the doc

## Report back
A short summary: what was installed (+versions), whether KVM accel worked, the boot time, the chosen app-delivery path, and the path to the Home-screen proof screenshot.
