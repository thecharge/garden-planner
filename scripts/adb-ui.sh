#!/usr/bin/env bash
# Low-noise ADB helpers for verifying the Expo app on a device or emulator.
# Every subcommand is idempotent and prints machine-readable output on stdout.
#
# Why this exists: guessing tap coordinates from a scaled screenshot is how you
# "tap" a button that isn't there. This wrapper dumps the live UI tree with
# uiautomator, resolves a human label to its on-device bounds, and taps the
# centre — no pixel arithmetic, no missed taps.
#
# Usage:
#   scripts/adb-ui.sh tap "Open viewfinder"          # by content-desc OR text
#   scripts/adb-ui.sh tap-tab capture|sectors|yield|rotation|nutrient|inventory|settings
#   scripts/adb-ui.sh shot capture-default           # → docs/screenshots/capture-default.png
#   scripts/adb-ui.sh shot-tmp capture-default       # → /tmp/capture-default.png (non-proof)
#   scripts/adb-ui.sh grant                          # grant camera + location runtime perms
#   scripts/adb-ui.sh alive                          # prints "PID=<n>" or exits 1
#   scripts/adb-ui.sh deep-link /yield               # opens gardenplanner:///yield
#   scripts/adb-ui.sh watch [seconds]                # foreground crash watch (default 60s)
#   scripts/adb-ui.sh size                           # "WxH" native display
#   scripts/adb-ui.sh dump                           # writes /tmp/ui.xml and prints path
#
# All subcommands auto-target the first online device (phone preferred over
# emulator). Override with:   ANDROID_SERIAL=emulator-5554 scripts/adb-ui.sh ...

set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
PACKAGE_ID="com.chepinci.gardenplanner"
DEEP_LINK_SCHEME="gardenplanner"
SCREENSHOT_DIR="${REPO_ROOT}/docs/screenshots"

err()  { printf "\033[1;31m%s\033[0m\n" "$*" >&2; }
ok()   { printf "\033[1;32m%s\033[0m\n" "$*"; }
info() { printf "\033[1;36m%s\033[0m\n" "$*"; }

# shellcheck disable=SC1091
. "${HERE}/setup-env.sh" >/dev/null 2>&1 || true

pick_device() {
  if [ -n "${ANDROID_SERIAL:-}" ]; then
    echo "${ANDROID_SERIAL}"
    return 0
  fi
  local phone emu
  phone="$(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 !~ /^emulator-/ {print $1; exit}')"
  if [ -n "${phone}" ]; then
    echo "${phone}"
    return 0
  fi
  emu="$(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 ~ /^emulator-/ {print $1; exit}')"
  if [ -n "${emu}" ]; then
    echo "${emu}"
    return 0
  fi
  err "No device attached. Plug in a phone over USB or run scripts/launch-emulator.sh."
  return 1
}

DEVICE="$(pick_device)" || exit 1

# --- subcommands ----------------------------------------------------------

cmd_dump() {
  adb -s "${DEVICE}" shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
  adb -s "${DEVICE}" pull /sdcard/ui.xml /tmp/ui.xml >/dev/null 2>&1
  echo "/tmp/ui.xml"
}

cmd_size() {
  adb -s "${DEVICE}" shell wm size | awk '{print $NF}'
}

# Find the first node whose content-desc OR text contains the given label.
# Prints "x1 y1 x2 y2" bounds, or exits 1 if not found.
#
# Substring (not exact) match because Feather-icon tabs emit a PUA glyph into
# content-desc (e.g. "<U+F17D>, Sectors"), and a user typing "Sectors" as a
# label should still match.
resolve_bounds() {
  local label="$1"
  cmd_dump >/dev/null
  # Each <node … /> lives on one big line. Split on '>' to get one per line,
  # then grep for the label and extract bounds="[x1,y1][x2,y2]".
  local line
  line="$(tr '>' '\n' </tmp/ui.xml \
    | grep -F -e "content-desc=\"${label}\"" -e "text=\"${label}\"" \
    | head -n 1 || true)"
  if [ -z "${line}" ]; then
    # Fall back to substring: content-desc or text CONTAINS the label.
    line="$(tr '>' '\n' </tmp/ui.xml \
      | grep -F -e "${label}\"" \
      | grep -E '(content-desc|text)="[^"]*' \
      | head -n 1 || true)"
  fi
  if [ -z "${line}" ]; then
    err "No UI node with content-desc or text containing '${label}'"
    err "Dump: /tmp/ui.xml — run 'scripts/adb-ui.sh dump' to inspect."
    return 1
  fi
  local bounds
  bounds="$(printf "%s\n" "${line}" \
    | grep -oE 'bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' \
    | head -n 1)"
  if [ -z "${bounds}" ]; then
    err "Found '${label}' but could not parse bounds: ${line}"
    return 1
  fi
  # bounds="[x1,y1][x2,y2]" → "x1 y1 x2 y2"
  printf "%s\n" "${bounds}" \
    | sed -E 's/^bounds="\[([0-9]+),([0-9]+)\]\[([0-9]+),([0-9]+)\]"$/\1 \2 \3 \4/'
}

cmd_tap() {
  local label="${1:-}"
  if [ -z "${label}" ]; then
    err "usage: adb-ui.sh tap \"<content-desc or visible text>\""
    return 1
  fi
  local b x1 y1 x2 y2 cx cy
  b="$(resolve_bounds "${label}")" || return 1
  # shellcheck disable=SC2086
  set -- ${b}; x1=$1; y1=$2; x2=$3; y2=$4
  cx=$(((x1 + x2) / 2))
  cy=$(((y1 + y2) / 2))
  adb -s "${DEVICE}" shell input tap "${cx}" "${cy}"
  # Settle time: RN bridges + screen transitions need a beat before the
  # next uiautomator dump reflects the new state. 600ms is enough for a
  # tab switch on a 3G emulator; real hardware is faster.
  sleep 0.6
  ok "tapped '${label}' at (${cx}, ${cy})"
}

cmd_tap_tab() {
  local tab="${1:-}"
  if [ -z "${tab}" ]; then
    err "usage: adb-ui.sh tap-tab capture|sectors|yield|rotation|nutrient|inventory|settings"
    return 1
  fi
  case "${tab}" in
    capture|sectors|yield|rotation|nutrient|inventory|settings) ;;
    *) err "unknown tab: ${tab}"; return 1 ;;
  esac
  # Deep-link over pixel tap — the 154-px-wide tab target is flaky under
  # `input tap`, especially on the currently-selected tab. `am start` with
  # a gardenplanner:// URL always routes to the right Expo Router screen.
  cmd_deep_link "/${tab}"
}

cmd_shot() {
  local name="${1:-}"
  if [ -z "${name}" ]; then
    err "usage: adb-ui.sh shot <name>  (→ docs/screenshots/<name>.png)"
    return 1
  fi
  mkdir -p "${SCREENSHOT_DIR}"
  local path="${SCREENSHOT_DIR}/${name}.png"
  adb -s "${DEVICE}" exec-out screencap -p > "${path}"
  if [ ! -s "${path}" ]; then
    err "screencap produced an empty file: ${path}"
    return 1
  fi
  ok "wrote ${path} ($(wc -c <"${path}") bytes)"
}

cmd_shot_tmp() {
  local name="${1:-}"
  if [ -z "${name}" ]; then
    err "usage: adb-ui.sh shot-tmp <name>  (→ /tmp/<name>.png)"
    return 1
  fi
  local path="/tmp/${name}.png"
  adb -s "${DEVICE}" exec-out screencap -p > "${path}"
  if [ ! -s "${path}" ]; then
    err "screencap produced an empty file: ${path}"
    return 1
  fi
  ok "wrote ${path} ($(wc -c <"${path}") bytes)"
}

cmd_grant() {
  adb -s "${DEVICE}" shell pm grant "${PACKAGE_ID}" android.permission.CAMERA             >/dev/null 2>&1 || true
  adb -s "${DEVICE}" shell pm grant "${PACKAGE_ID}" android.permission.ACCESS_FINE_LOCATION >/dev/null 2>&1 || true
  adb -s "${DEVICE}" shell pm grant "${PACKAGE_ID}" android.permission.ACCESS_COARSE_LOCATION >/dev/null 2>&1 || true
  ok "granted camera + location runtime perms to ${PACKAGE_ID}"
}

cmd_alive() {
  local pid
  pid="$(adb -s "${DEVICE}" shell pidof "${PACKAGE_ID}" | tr -d '\r')"
  if [ -z "${pid}" ]; then
    err "DEAD: ${PACKAGE_ID} is not running on ${DEVICE}"
    return 1
  fi
  echo "PID=${pid}"
}

cmd_deep_link() {
  local path="${1:-/}"
  local url="${DEEP_LINK_SCHEME}://${path#/}"
  adb -s "${DEVICE}" shell am start -W \
    -a android.intent.action.VIEW \
    -d "${url}" \
    "${PACKAGE_ID}" >/dev/null
  ok "deep-linked ${url}"
}

cmd_watch() {
  local seconds="${1:-60}"
  info "watching logcat on ${DEVICE} for ${seconds}s (FATAL / OOM / app-died)"
  adb -s "${DEVICE}" logcat -c
  # `timeout` is GNU coreutils; available on Linux. On macOS use `gtimeout`.
  timeout "${seconds}" adb -s "${DEVICE}" logcat -v brief 2>/dev/null \
    | grep -E --line-buffered "FATAL EXCEPTION|com\.chepinci.*died|lowmemorykiller.*Killing|OutOfMemory|ANR in com\.chepinci|Process com\.chepinci.*has died|libc.*Fatal signal" \
    || true
  info "watch window closed."
}

main() {
  local sub="${1:-}"; shift || true
  case "${sub}" in
    tap)        cmd_tap "$@" ;;
    tap-tab)    cmd_tap_tab "$@" ;;
    shot)       cmd_shot "$@" ;;
    shot-tmp)   cmd_shot_tmp "$@" ;;
    grant)      cmd_grant ;;
    alive)      cmd_alive ;;
    deep-link)  cmd_deep_link "$@" ;;
    watch)      cmd_watch "$@" ;;
    size)       cmd_size ;;
    dump)       cmd_dump ;;
    *)
      err "unknown subcommand: ${sub}"
      err "available: tap tap-tab shot shot-tmp grant alive deep-link watch size dump"
      return 1
      ;;
  esac
}

main "$@"
