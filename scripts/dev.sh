#!/usr/bin/env bash
# One-command dev launcher.
#
# From a fresh shell:
#   pnpm dev           # default: dev client + Metro + live reload
#   pnpm dev release   # install the built release APK (no Metro, no rebuild)
#
# Does, in order:
#   1. Sources scripts/setup-env.sh.
#   2. Runs scripts/doctor.sh; aborts on fail.
#   3. Picks a device — preference: real phone > emulator. Launches the AVD if
#      neither is present.
#   4. Establishes adb reverse tcp:8081 tcp:8081 for the chosen device.
#   5. Forces the dev client URL to localhost:8081 (REACT_NATIVE_PACKAGER_HOSTNAME)
#      so the bundle URL does not depend on the host LAN IP.
#   6. Starts Metro in the background if not already running on :8081.
#   7. Runs expo run:android --no-bundler to install + launch the app on the
#      chosen device.
#   8. Tails the Metro log in the foreground — Ctrl+C stops the tail but
#      keeps Metro alive so hot-reload survives between pnpm dev runs.
#
# In release mode steps 5-7 become: install the prebuilt release APK and launch.
#
# Teardown (kill Metro + emulator):  pnpm dev:stop

set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
METRO_LOG="/tmp/garden-metro.log"
METRO_PID_FILE="/tmp/garden-metro.pid"
RELEASE_APK="${REPO_ROOT}/apps/mobile/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE_ID="com.chepinci.gardenplanner"

MODE="${1:-dev}"

banner() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
err()    { printf "\033[1;31m%s\033[0m\n" "$*" >&2; }
ok()     { printf "\033[1;32m%s\033[0m\n" "$*"; }

banner "1/7 Sourcing setup-env.sh"
# shellcheck disable=SC1091
. "${HERE}/setup-env.sh"

banner "2/7 Running doctor.sh"
if ! "${HERE}/doctor.sh"; then
  err "doctor.sh reported missing pieces. Fix them and try again."
  exit 1
fi

banner "3/7 Picking a device (phone > emulator)"
# List attached devices: serial on col 1, state on col 2 (only rows with
# state == "device"). Prefer a real phone over the emulator.
mapfile -t PHONES < <(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 !~ /^emulator-/ {print $1}')
mapfile -t EMUS   < <(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1  ~ /^emulator-/ {print $1}')

if [ "${#PHONES[@]}" -gt 0 ]; then
  DEVICE="${PHONES[0]}"
  DEVICE_KIND="phone"
elif [ "${#EMUS[@]}" -gt 0 ]; then
  DEVICE="${EMUS[0]}"
  DEVICE_KIND="emulator"
else
  echo "No device attached — launching the AVD…"
  "${HERE}/launch-emulator.sh"
  # Re-detect after launch.
  mapfile -t EMUS < <(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 ~ /^emulator-/ {print $1}')
  if [ "${#EMUS[@]}" -eq 0 ]; then
    err "AVD did not come up. Check 'adb devices' manually."
    exit 1
  fi
  DEVICE="${EMUS[0]}"
  DEVICE_KIND="emulator"
fi
ok "Using device: ${DEVICE} (${DEVICE_KIND})"
export ANDROID_SERIAL="${DEVICE}"

banner "4/7 adb reverse tcp:8081 tcp:8081 on ${DEVICE}"
adb -s "${DEVICE}" reverse tcp:8081 tcp:8081 || {
  err "adb reverse failed. Is the device online?"
  exit 1
}

if [ "${MODE}" = "release" ]; then
  if [ ! -f "${RELEASE_APK}" ]; then
    err "No release APK at ${RELEASE_APK}"
    err "Build it first: pnpm --filter apps-mobile run apk:local"
    exit 1
  fi
  banner "5/5 Installing release APK on ${DEVICE}"
  adb -s "${DEVICE}" install -r "${RELEASE_APK}" || {
    err "install -r failed. If you signed the APK differently than the previous build, run: adb -s ${DEVICE} uninstall ${PACKAGE_ID} and retry."
    exit 1
  }
  adb -s "${DEVICE}" shell am start -n "${PACKAGE_ID}/.MainActivity"
  ok "Release APK installed + launched on ${DEVICE}."
  ok "No Metro needed in release mode."
  exit 0
fi

banner "5/7 Forcing dev-client URL to localhost:8081"
# Without this, Expo auto-detects the host LAN IP and the device cannot reach
# it over USB. adb reverse + localhost is the reliable path.
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost

banner "6/7 Ensuring Metro is running on :8081"
metro_up() {
  curl --silent --fail --max-time 1 "http://localhost:8081/status" >/dev/null 2>&1
}
# Make sure the log file always exists so the final tail -f never errors out.
touch "${METRO_LOG}"
if metro_up; then
  echo "Metro already responding on :8081."
else
  echo "Starting Metro in the background → ${METRO_LOG}"
  : > "${METRO_LOG}"
  (
    cd "${REPO_ROOT}"
    REACT_NATIVE_PACKAGER_HOSTNAME=localhost \
      nohup pnpm --filter apps-mobile exec expo start --dev-client --port 8081 \
        >>"${METRO_LOG}" 2>&1 &
    echo $! >"${METRO_PID_FILE}"
  )
  # Wait up to 90 seconds for Metro to respond.
  for _ in $(seq 1 90); do
    sleep 1
    if metro_up; then
      break
    fi
  done
  if ! metro_up; then
    err "Metro did not come up in 90s. See ${METRO_LOG} for clues."
    exit 1
  fi
fi

banner "7/7 Installing + launching the APK on ${DEVICE}"
# expo run:android's --device takes a device NAME, not an adb serial. We
# already export ANDROID_SERIAL above, which expo honours for install +
# launch targeting, so the flag would only cause "device not found".
(
  cd "${REPO_ROOT}"
  REACT_NATIVE_PACKAGER_HOSTNAME=localhost \
    pnpm --filter apps-mobile exec expo run:android --no-bundler
)

banner "Done. Streaming Metro log (Ctrl+C stops the tail, not Metro)."
banner "     Teardown: pnpm dev:stop"
banner "     Release path: pnpm dev release"
exec tail -f "${METRO_LOG}"
