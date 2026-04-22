#!/usr/bin/env bash
# One-command dev launcher.
#
# From a fresh shell:
#   pnpm dev
#
# Does, in order:
#   1. Sources scripts/setup-env.sh.
#   2. Runs scripts/doctor.sh; aborts on fail.
#   3. Ensures an emulator is running (launches the AVD if not).
#   4. Establishes adb reverse tcp:8081 tcp:8081 (reset on every adb restart).
#   5. Starts Metro in the background if not already running on :8081.
#   6. Runs `expo run:android --no-bundler` to install + launch the app.
#   7. Tails the Metro log in the foreground — Ctrl+C stops the tail but
#      keeps Metro alive so hot-reload survives between `pnpm dev` runs.
#
# Teardown (kill Metro + emulator):  pnpm dev:stop

set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
METRO_LOG="/tmp/garden-metro.log"
METRO_PID_FILE="/tmp/garden-metro.pid"

banner() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
err()    { printf "\033[1;31m%s\033[0m\n" "$*" >&2; }

banner "1/7 Sourcing setup-env.sh"
# shellcheck disable=SC1091
. "${HERE}/setup-env.sh"

banner "2/7 Running doctor.sh"
if ! "${HERE}/doctor.sh"; then
  err "doctor.sh reported missing pieces. Fix them and try again."
  exit 1
fi

banner "3/7 Ensuring an emulator is booted"
if adb devices 2>/dev/null | awk 'NR>1 && $2=="device"' | grep -q .; then
  echo "adb already sees a device."
else
  "${HERE}/launch-emulator.sh"
fi

banner "4/7 adb reverse tcp:8081 tcp:8081"
adb reverse tcp:8081 tcp:8081 || {
  err "adb reverse failed. Is the emulator online?"
  exit 1
}

banner "5/7 Ensuring Metro is running on :8081"
metro_up() {
  curl --silent --fail --max-time 1 "http://localhost:8081/status" >/dev/null 2>&1
}
if metro_up; then
  echo "Metro already responding on :8081."
else
  echo "Starting Metro in the background → ${METRO_LOG}"
  : > "${METRO_LOG}"
  (
    cd "${REPO_ROOT}"
    nohup pnpm --filter apps-mobile exec expo start --dev-client --port 8081 \
      >>"${METRO_LOG}" 2>&1 &
    echo $! >"${METRO_PID_FILE}"
  )
  # Wait up to 60 seconds for Metro to respond.
  for _ in $(seq 1 60); do
    sleep 1
    if metro_up; then
      break
    fi
  done
  if ! metro_up; then
    err "Metro did not come up in 60s. See ${METRO_LOG} for clues."
    exit 1
  fi
fi

banner "6/7 Re-running adb reverse after Metro start"
adb reverse tcp:8081 tcp:8081 >/dev/null || true

banner "7/7 Installing + launching the APK on the device"
(
  cd "${REPO_ROOT}"
  pnpm --filter apps-mobile exec expo run:android --no-bundler
)

banner "Done. Streaming Metro log (Ctrl+C stops the tail, not Metro)."
banner "     Teardown: pnpm dev:stop"
exec tail -f "${METRO_LOG}"
