#!/usr/bin/env sh
# Boot the garden-planner AVD and wait until adb sees it.

set -eu

AVD_NAME="${GARDEN_PLANNER_AVD:-Pixel_6_API_35}"
HERE="$(cd "$(dirname "$0")" && pwd)"

if ! command -v emulator >/dev/null 2>&1; then
  echo "emulator not on PATH — run: . ./scripts/setup-env.sh" >&2
  exit 1
fi

# Ensure the AVD exists (idempotent).
"${HERE}/create-avd.sh"

if adb devices 2>/dev/null | grep -qE "emulator-\d+\s+device"; then
  echo "Emulator already running."
  exit 0
fi

echo "Starting emulator '${AVD_NAME}' in the background…"
nohup emulator -avd "${AVD_NAME}" -no-snapshot-save -no-boot-anim \
  >/tmp/emulator.log 2>&1 &

echo "Waiting for adb to see a device…"
adb wait-for-device
# Wait for boot completion (up to ~120s).
for i in $(seq 1 60); do
  if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
    break
  fi
  sleep 2
done

adb devices
echo "Emulator ready. Next:"
echo "  pnpm --filter apps-mobile run start      # launch Metro bundler"
echo "  pnpm --filter apps-mobile run android    # build + install the APK"
