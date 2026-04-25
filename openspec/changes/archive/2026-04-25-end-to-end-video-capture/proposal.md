## Why

The Garden Planner app has no recorded demonstration of its full user flow, making it hard for contributors, reviewers, and potential users to evaluate the product without running the app themselves. A committed end-to-end screen recording closes that gap and also serves as a live regression check — a blank or crash-cut recording immediately signals a broken build.

## What Changes

- New `docs/demo/` directory committed to the repository.
- New `docs/demo/end-to-end.mp4` screen recording covering every major user flow.
- `README.md` demo-video placeholder updated to link to `docs/demo/end-to-end.mp4`.
- Recording is produced by `adb shell screenrecord` against the Pixel_6_API_35 emulator; the capture script uses only label-based `scripts/adb-ui.sh` commands (no hard-coded coordinates).

## Capabilities

### New Capabilities

- `end-to-end-demo-recording`: Scripted ADB-driven screen recording covering app open, capture tab (permission → grant → viewfinder → scan), sector creation, harvest logging, yield table, inventory, and settings (theme + font switches). Validates file size >500 KB and app health via `alive` after capture.

### Modified Capabilities

<!-- none -->

## Impact

- `docs/demo/end-to-end.mp4` — new binary asset (~1–20 MB).
- `README.md` — one-line update to the demo placeholder.
- No source code changes; no package dependencies affected.
- Requires Pixel_6_API_35 AVD to be running and app installed before the recording task executes.
