#!/usr/bin/env sh
# Create a default Pixel 6 API 35 AVD if it does not already exist.
# Depends on `./scripts/setup-env.sh` being sourced OR ANDROID_HOME + PATH set.

set -eu

AVD_NAME="${GARDEN_PLANNER_AVD:-Pixel_6_API_35}"
SYSTEM_IMAGE="system-images;android-35;google_apis;x86_64"

if ! command -v avdmanager >/dev/null 2>&1; then
  echo "avdmanager not on PATH — run: . ./scripts/setup-env.sh" >&2
  exit 1
fi

if avdmanager list avd | grep -q "Name: ${AVD_NAME}"; then
  echo "AVD '${AVD_NAME}' already exists."
  exit 0
fi

if ! sdkmanager --list_installed 2>/dev/null | grep -q "${SYSTEM_IMAGE}"; then
  echo "Installing system image ${SYSTEM_IMAGE}…"
  yes 2>/dev/null | sdkmanager "${SYSTEM_IMAGE}"
fi

echo "Creating AVD '${AVD_NAME}'…"
echo "no" | avdmanager create avd \
  --name "${AVD_NAME}" \
  --package "${SYSTEM_IMAGE}" \
  --device "pixel_6" \
  --force

# AVD defaults are hostile to a dev-mode RN bundle + CameraView preview.
# Host GPU + 3 GB RAM + 512 MB Dalvik heap are the minimum to keep Capture
# from OOM-killing during `pnpm dev`. See scripts/launch-emulator.sh for the
# defensive emulator flags that also apply at boot.
CONFIG="${HOME}/.android/avd/${AVD_NAME}.avd/config.ini"
if [ -f "${CONFIG}" ]; then
  # sed -i: apply key=value overrides, preserving the " = " spacing avdmanager emits
  sed -i \
    -e 's|^hw\.gpu\.enabled .*|hw.gpu.enabled = yes|' \
    -e 's|^hw\.gpu\.mode .*|hw.gpu.mode = host|' \
    -e 's|^hw\.ramSize .*|hw.ramSize = 3072M|' \
    -e 's|^vm\.heapSize .*|vm.heapSize = 512M|' \
    "${CONFIG}"
  echo "Patched ${CONFIG}: gpu=host, ram=3072M, heap=512M."
fi

echo "Done. Launch with: ./scripts/launch-emulator.sh"
