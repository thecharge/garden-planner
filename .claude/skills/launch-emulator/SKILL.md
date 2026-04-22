---
name: launch-emulator
description: Source the dev-env and boot the default Android emulator for garden-planner. Use when the user wants to "start the emulator" or "run the app on Android" and no device is currently connected.
---

## Purpose

Bring up the `Pixel_6_API_35` AVD so the user can run `pnpm --filter apps-mobile run android` against it.

## Steps

1. Source the env script (idempotent):
   ```bash
   . ./scripts/setup-env.sh
   ```
2. Verify toolchain:
   ```bash
   ./scripts/doctor.sh
   ```
   If any row is `MISS`, stop and follow `BUILDING.md`.
3. Create the AVD if missing + boot it:
   ```bash
   ./scripts/launch-emulator.sh
   ```
   The script waits for `adb wait-for-device` and prints `adb devices`.
4. Confirm a device is connected:
   ```bash
   adb devices
   ```
   Expect a line like `emulator-5554    device`.

## Common next steps

- `pnpm --filter apps-mobile run start` — launch Metro.
- `pnpm --filter apps-mobile run android` — build + install the APK.
- Press `a` in Metro to attach to the running emulator.

## Troubleshooting

- **No `/dev/kvm`**: enable VT-x/AMD-V in BIOS; the emulator refuses to start without it.
- **AVD won't boot**: delete and re-create — `avdmanager delete avd -n Pixel_6_API_35 && ./scripts/create-avd.sh`.
- **Java not found**: `. ./scripts/setup-env.sh` again; if JBR isn't installed, BUILDING.md Step 1.
