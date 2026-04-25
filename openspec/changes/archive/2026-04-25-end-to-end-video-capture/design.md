## Context

The Garden Planner app runs on a Pixel_6_API_35 Android emulator (AVD). All device interaction is mediated by `scripts/adb-ui.sh`, which wraps `adb shell uiautomator` for label-based tapping and `adb shell screenrecord` for video. The repository currently has no committed demo asset; `README.md` contains a placeholder comment where a demo link should appear.

## Goals / Non-Goals

**Goals:**

- Produce a single MP4 (`docs/demo/end-to-end.mp4`) via `adb shell screenrecord` that covers every major user flow in under 3 minutes.
- Validate the recording is not a crash/blank frame (file size >500 KB).
- Confirm app health post-recording via `scripts/adb-ui.sh alive`.
- Commit `docs/demo/end-to-end.mp4` and the updated `README.md` together.

**Non-Goals:**

- Automated CI video regression (out of scope; this is a manual/scripted capture step).
- Cross-platform (iOS) recording.
- Audio capture.
- Video editing or compression post-capture.

## Decisions

### D1 — Use `adb shell screenrecord` directly

`adb shell screenrecord /sdcard/demo.mp4` is the only approved method. It runs on-device at native resolution, requires no host-side encoder, and is already available on API 19+. The 3-minute hard limit imposed by the Android OS is acceptable because the scripted flow fits within that window.

Alternatives considered:

- **scrcpy record mode**: adds a host-side dependency and is not present in the project toolchain.
- **emulator screen capture via QEMU**: platform-specific and not scriptable via existing `adb-ui.sh` helpers.

### D2 — Label-based navigation only

All taps use `scripts/adb-ui.sh tap "<accessibility-label>"` or `tap-tab <name>`. Hard-coded pixel coordinates are forbidden by `CLAUDE.md` and would break on any display-density change.

### D3 — File-size guard replaces frame inspection

Inspecting individual frames for content would require `ffprobe`/`ffmpeg`, which are not guaranteed to be present. A simple `stat`-based size check (>500 KB) is a reliable proxy: a black crash recording is typically <30 KB; a genuine 3-minute recording at 720p is several megabytes.

### D4 — `docs/demo/` committed as a regular directory with a `.gitkeep`

The directory does not yet exist. Creating it with a `.gitkeep` first makes the `mkdir` step idempotent in future runs. The MP4 is committed as a binary asset (no LFS required for a single demo file of this size).

### D5 — Recording process sequence

1. Start `screenrecord` in the background (subshell or `&`).
2. Drive the full flow with timed `sleep` gaps between `adb-ui.sh` commands to allow UI transitions.
3. Send `SIGINT` to the `screenrecord` process (or `adb shell pkill -2 screenrecord`) to finalize the MP4 before the 3-minute OS kill.
4. `adb pull` the file; validate size; run `alive`.

## Risks / Trade-offs

- **Emulator GPU rendering lag** → If UI transitions are too fast, frames may be blank mid-flow. Mitigation: insert `sleep 2` between major tab switches and action sequences.
- **`screenrecord` 3-minute OS limit** → If the scripted flow takes longer than 180 s, the recording is truncated without error. Mitigation: time the full flow during development; current estimate is ~90 s.
- **App crash during recording** → Recording stops, pull produces a short file that fails the size check. Mitigation: run `alive` after pull; if it exits 1, document the crash and do not commit the recording.
- **Camera permission not granted before viewfinder** → The capture tab will show a permission screen instead of the viewfinder. Mitigation: `scripts/adb-ui.sh grant` is executed before `screenrecord` starts.
- **Large binary in git** → A single ~5–15 MB MP4 is acceptable. If the file grows beyond ~50 MB in the future, migrate to Git LFS.
