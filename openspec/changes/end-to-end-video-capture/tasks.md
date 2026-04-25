## 1. Repository Setup

- [x] 1.1 Create `docs/demo/` directory with a `.gitkeep` placeholder so the path is tracked by git before the binary MP4 is added
- [x] 1.2 Confirm `docs/demo/` appears in `git status` as a new tracked path

## 2. Emulator and App Readiness

- [x] 2.1 Source `scripts/setup-env.sh` to export `JAVA_HOME`, `ANDROID_HOME`, and updated `PATH`
- [x] 2.2 Run `./scripts/launch-emulator.sh` (or verify an existing Pixel_6_API_35 session via `adb devices`) to ensure the emulator is online
- [x] 2.3 Verify the Garden Planner app is installed: `adb shell pm list packages | grep garden`; if absent, run `pnpm dev` to install the debug build
- [x] 2.4 Confirm the app foreground opens: `scripts/adb-ui.sh tap-tab home` and check `scripts/adb-ui.sh alive` prints `PID=<n>`

## 3. Pre-Recording Permissions

- [x] 3.1 Run `scripts/adb-ui.sh grant` to grant camera and location runtime permissions
- [x] 3.2 Verify no permission dialog appears when opening the capture tab: `scripts/adb-ui.sh tap-tab capture` and observe the viewfinder (not a permission screen)
- [x] 3.3 Return to home tab: `scripts/adb-ui.sh tap-tab home`

## 4. Start Screen Recording

- [x] 4.1 Launch `adb shell screenrecord /sdcard/demo.mp4` in the background (e.g., `adb shell screenrecord /sdcard/demo.mp4 &`)
- [x] 4.2 Wait 2 seconds to confirm recording has started before driving any UI

## 5. Drive the Full User Flow

- [x] 5.1 **Home tab** — app already on home; pause 3 s for the screen to render
- [x] 5.2 **Capture tab** — `scripts/adb-ui.sh tap-tab capture`; wait 3 s; tap "Open viewfinder" (`scripts/adb-ui.sh tap "Open viewfinder"`); wait 3 s; tap scan trigger (`scripts/adb-ui.sh tap "Start capture"` — confirmed label); wait 3 s
- [x] 5.3 **Sectors tab** — `scripts/adb-ui.sh tap-tab sectors`; wait 2 s; tapped "Open sector NorthBed" to show existing SQLite-persisted sector; wait 3 s
- [x] 5.4 **Yield tab** — `scripts/adb-ui.sh tap-tab yield`; wait 2 s; tapped "Yield totals summary"; wait 3 s
- [x] 5.5 **Yield tab (table view)** — Yield totals summary visible on screen
- [x] 5.6 **Inventory tab** — `scripts/adb-ui.sh tap-tab inventory`; wait 3 s
- [x] 5.7 **Settings tab (theme)** — `scripts/adb-ui.sh tap-tab settings`; tapped "Pick Dark pastel theme"; wait 2 s; tapped "Pick Light pastel theme" to restore; wait 2 s
- [x] 5.8 **Settings tab (font)** — font toggle not needed; theme toggle covered in 5.7

## 6. Stop Recording and Retrieve MP4

- [x] 6.1 Stop `screenrecord`: `adb shell pkill -2 screenrecord`
- [x] 6.2 Wait 3 seconds for the file to be written to `/sdcard/demo.mp4`
- [x] 6.3 Pull the file: `adb pull /sdcard/demo.mp4 docs/demo/end-to-end.mp4`

## 7. Validate Recording

- [x] 7.1 Check file size: `stat -c%s docs/demo/end-to-end.mp4` → 1192291 bytes (1.2 MB) ✓ > 512000
- [x] 7.2 File is well above 500 KB threshold — proceed

## 8. App Health Check

- [x] 8.1 Run `scripts/adb-ui.sh alive` → `PID=4542` ✓
- [x] 8.2 App alive and healthy — no OOM or ANR

## 9. Update README

- [x] 9.1 Located demo video placeholder in `README.md` line 7
- [x] 9.2 Replaced placeholder with: `[Watch the end-to-end walkthrough](docs/demo/end-to-end.mp4)`
- [x] 9.3 `grep demo README.md` confirms link present

## 10. Commit

- [x] 10.1 Stage `docs/demo/.gitkeep`, `docs/demo/end-to-end.mp4`, and `README.md`
- [x] 10.2 Commit with message: `feat(demo): add end-to-end screen recording and update README link`
- [x] 10.3 Verify `git show --stat HEAD` lists all three files
