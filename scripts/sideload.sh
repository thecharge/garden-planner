#!/usr/bin/env bash
# Install the release APK on the first real phone (falling back to emulator).
# No Metro, no build — just the prebuilt APK.
#
#   pnpm sideload
#
# Prereq: apps/mobile/android/app/build/outputs/apk/release/app-release.apk
# Build it once: pnpm --filter apps-mobile run apk:local

set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
APK="${REPO_ROOT}/apps/mobile/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE_ID="com.chepinci.gardenplanner"

banner() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
err()    { printf "\033[1;31m%s\033[0m\n" "$*" >&2; }
ok()     { printf "\033[1;32m%s\033[0m\n" "$*"; }

# shellcheck disable=SC1091
. "${HERE}/setup-env.sh"

if [ ! -f "${APK}" ]; then
  err "No release APK at ${APK}"
  err "Build it first: pnpm --filter apps-mobile run apk:local"
  exit 1
fi

mapfile -t PHONES < <(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 !~ /^emulator-/ {print $1}')
mapfile -t EMUS   < <(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1  ~ /^emulator-/ {print $1}')

if [ "${#PHONES[@]}" -gt 0 ]; then
  TARGETS=("${PHONES[@]}")
elif [ "${#EMUS[@]}" -gt 0 ]; then
  TARGETS=("${EMUS[@]}")
else
  err "No device attached. Connect a phone over USB (with USB debugging) or start an emulator."
  exit 1
fi

for DEVICE in "${TARGETS[@]}"; do
  banner "Installing on ${DEVICE}"
  if adb -s "${DEVICE}" install -r "${APK}" 2>&1 | tee /tmp/sideload-${DEVICE}.log | grep -q "INSTALL_FAILED_UPDATE_INCOMPATIBLE\|INSTALL_FAILED_VERSION_DOWNGRADE\|signatures do not match"; then
    banner "Signature mismatch — uninstalling old copy and retrying"
    adb -s "${DEVICE}" uninstall "${PACKAGE_ID}" >/dev/null 2>&1 || true
    adb -s "${DEVICE}" install -r "${APK}" || {
      err "Install still failed. See /tmp/sideload-${DEVICE}.log"
      continue
    }
  fi
  banner "Launching ${PACKAGE_ID} on ${DEVICE}"
  adb -s "${DEVICE}" shell am start -n "${PACKAGE_ID}/.MainActivity"
  ok "Done on ${DEVICE}."
done

banner "All targets processed."
