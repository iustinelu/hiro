# Hiro Android QA env — source this before running `expo run:android` / `adb` / `emulator` manually.
#   source scripts/android-env.sh
#
# All tooling is user-local (installed by the E-A harness task). No sudo, no system changes.
# See docs/v0.1.3/mobile-qa-harness.md for the full setup + per-branch QA recipe.

export JAVA_HOME="$HOME/.local/share/jdk/temurin-17"
export ANDROID_HOME="$HOME/.local/share/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

# platform-tools first so the SDK's adb (v37+) wins over the older /usr/bin/adb (debian 28.x).
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "Android QA env ready:"
echo "  JAVA_HOME=$JAVA_HOME"
echo "  ANDROID_HOME=$ANDROID_HOME"
echo "  java:     $(java -version 2>&1 | head -1)"
echo "  adb:      $(adb --version 2>/dev/null | head -1)"
