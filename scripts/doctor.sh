#!/usr/bin/env sh
# Check the dev environment. Exit non-zero if any required piece is missing.
# Run:   ./scripts/doctor.sh

set -u

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
ok()    { green "OK   $*"; }
bad()   { red   "MISS $*"; FAIL=1; }

FAIL=0

# JDK
if command -v java >/dev/null 2>&1; then
  ok  "Java: $(java --version 2>&1 | head -1)"
else
  if [ -x "/snap/android-studio/current/jbr/bin/java" ]; then
    ok  "Java (not on PATH — will be exported by setup-env.sh): /snap/android-studio/current/jbr"
  else
    bad "Java — install JDK 17+ or source ./scripts/setup-env.sh"
  fi
fi

# Android SDK
if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME" ]; then
  ok  "ANDROID_HOME=$ANDROID_HOME"
elif [ -d "$HOME/Android/Sdk" ]; then
  ok  "Android SDK on disk ($HOME/Android/Sdk) — source ./scripts/setup-env.sh to export it"
else
  bad "Android SDK — run the steps in BUILDING.md under 'Install Android SDK'"
fi

# adb
if command -v adb >/dev/null 2>&1; then
  ok  "adb: $(adb --version 2>&1 | head -1)"
elif [ -x "${ANDROID_HOME:-$HOME/Android/Sdk}/platform-tools/adb" ]; then
  ok  "adb on disk (not on PATH — source setup-env.sh)"
else
  bad "adb — run sdkmanager \"platform-tools\""
fi

# emulator
if command -v emulator >/dev/null 2>&1; then
  ok  "emulator: $(emulator -version 2>&1 | head -1)"
elif [ -x "${ANDROID_HOME:-$HOME/Android/Sdk}/emulator/emulator" ]; then
  ok  "emulator on disk (not on PATH — source setup-env.sh)"
else
  bad "emulator — run sdkmanager \"emulator\""
fi

# sdkmanager / avdmanager
for tool in sdkmanager avdmanager; do
  if command -v "$tool" >/dev/null 2>&1; then
    ok  "$tool on PATH"
  elif [ -x "${ANDROID_HOME:-$HOME/Android/Sdk}/cmdline-tools/latest/bin/$tool" ]; then
    ok  "$tool on disk (not on PATH — source setup-env.sh)"
  else
    bad "$tool — extract Android cmdline-tools into \$ANDROID_HOME/cmdline-tools/latest"
  fi
done

# pnpm + Node
if command -v pnpm >/dev/null 2>&1; then
  ok  "pnpm: $(pnpm --version)"
else
  bad "pnpm — npm i -g pnpm@10"
fi
if command -v node >/dev/null 2>&1; then
  ok  "node: $(node --version)"
else
  bad "node — install Node 20+ (see .nvmrc)"
fi

# Expo CLI (optional — apps/mobile can run it via pnpm)
if command -v npx >/dev/null 2>&1; then
  ok  "npx available (use 'pnpm --filter apps-mobile run start' for Expo)"
else
  bad "npx — install Node 20+ (comes with npm)"
fi

# Repo state
if [ -d "$(dirname "$0")/.." ] && [ -f "$(dirname "$0")/../package.json" ]; then
  ok  "Repo root detected: $(cd "$(dirname "$0")/.." && pwd)"
fi

if [ $FAIL -eq 0 ]; then
  green "--- All required dev-env pieces present. ---"
  exit 0
fi
red "--- Some required pieces are missing. Follow BUILDING.md. ---"
exit 1
