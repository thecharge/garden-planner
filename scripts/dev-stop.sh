#!/usr/bin/env bash
# Teardown for `pnpm dev` — kills the background Metro and shuts down the
# running emulator. Safe to run even if nothing is active.

set -u

METRO_PID_FILE="/tmp/garden-metro.pid"

banner() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

banner "Stopping Metro"
if [ -f "${METRO_PID_FILE}" ]; then
  pid="$(cat "${METRO_PID_FILE}" 2>/dev/null || echo)"
  if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
    # Kill the process group so child node workers die with it.
    kill -TERM "-${pid}" 2>/dev/null || kill -TERM "${pid}" 2>/dev/null || true
    sleep 1
    kill -KILL "-${pid}" 2>/dev/null || kill -KILL "${pid}" 2>/dev/null || true
    echo "Killed Metro pid ${pid}"
  else
    echo "Stale pid file; cleaning up."
  fi
  rm -f "${METRO_PID_FILE}"
else
  # Fallback: anything on :8081.
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti :8081 2>/dev/null || true)"
    if [ -n "${pids}" ]; then
      echo "${pids}" | xargs -r kill -TERM
      echo "Killed processes listening on :8081."
    fi
  fi
fi

banner "Stopping emulator"
if command -v adb >/dev/null 2>&1; then
  adb devices 2>/dev/null | awk 'NR>1 && $2=="device"{print $1}' | while read -r d; do
    echo "Sending shutdown to ${d}"
    adb -s "${d}" emu kill 2>/dev/null || true
  done
fi

banner "Done."
