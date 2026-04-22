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
echo "Done. Launch with: ./scripts/launch-emulator.sh"
