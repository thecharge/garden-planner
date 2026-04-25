# end-to-end-demo-recording Specification

## Purpose

Defines the requirements for capturing a scripted end-to-end screen recording of the Garden Planner app covering all major user flows, validating the recording, and publishing it to the repository.

## Requirements

### Requirement: Demo directory exists before recording

The system SHALL ensure `docs/demo/` exists in the repository before any recording step is executed.

#### Scenario: Directory created when absent

- **WHEN** the recording task begins and `docs/demo/` does not exist
- **THEN** the directory (and a `.gitkeep` placeholder) SHALL be created so subsequent `adb pull` commands have a valid destination

### Requirement: Emulator is running and app is installed

The system SHALL verify that the Pixel_6_API_35 emulator is online and the Garden Planner app is installed before recording starts.

#### Scenario: Emulator already running

- **WHEN** `adb devices` lists an active emulator
- **THEN** the recording script SHALL proceed without launching a new AVD

#### Scenario: App not installed

- **WHEN** the app package is absent from the emulator
- **THEN** `pnpm dev` SHALL be invoked to install the debug build before continuing

### Requirement: Camera and location permissions granted before recording

The system SHALL call `scripts/adb-ui.sh grant` before `adb shell screenrecord` is started so that the capture tab opens to the viewfinder and not a permission dialog.

#### Scenario: Permissions granted successfully

- **WHEN** `scripts/adb-ui.sh grant` exits with code 0
- **THEN** the recording script SHALL proceed to start `adb shell screenrecord`

### Requirement: Full user flow captured in a single screenrecord session

The system SHALL record all of the following flows in order within a single `adb shell screenrecord /sdcard/demo.mp4` session:

1. App open (home tab visible)
2. Capture tab: permission screen → grant → open viewfinder → initiate scan
3. Sectors tab: create a new sector
4. Yield tab: log a harvest entry
5. Yield tab: view the yield table
6. Inventory tab: view inventory list
7. Settings tab: toggle theme switch; toggle font switch

#### Scenario: Recording covers all tabs

- **WHEN** the recording script runs to completion without interruption
- **THEN** the output MP4 SHALL contain footage of all seven flows listed above

#### Scenario: Flow completes within time limit

- **WHEN** the scripted flow is driven at its designed pace
- **THEN** total elapsed time from `screenrecord` start to `pkill` SHALL be under 180 seconds

### Requirement: Recording retrieved and validated

The system SHALL pull the MP4 from `/sdcard/demo.mp4` to `docs/demo/end-to-end.mp4` and validate it is not a blank or crash recording.

#### Scenario: Valid recording retrieved

- **WHEN** `adb pull /sdcard/demo.mp4 docs/demo/end-to-end.mp4` succeeds
- **THEN** the local file size SHALL be greater than 500 KB

#### Scenario: Blank recording detected

- **WHEN** the pulled file is ≤500 KB
- **THEN** the recording script SHALL exit with a non-zero code, run `scripts/adb-ui.sh alive`, log the result, and NOT commit the file

### Requirement: App health confirmed after recording

The system SHALL run `scripts/adb-ui.sh alive` after the recording is pulled and validate the app process is still running.

#### Scenario: App alive after full flow

- **WHEN** `scripts/adb-ui.sh alive` is called after a successful recording pull
- **THEN** it SHALL print `PID=<n>` and exit with code 0

#### Scenario: App crashed during recording

- **WHEN** `scripts/adb-ui.sh alive` exits with non-zero code
- **THEN** the recording SHALL be discarded and the crash SHALL be documented before any commit is made

### Requirement: README updated with demo link

The system SHALL replace the demo-video placeholder in `README.md` with a relative link to `docs/demo/end-to-end.mp4`.

#### Scenario: Placeholder replaced

- **WHEN** the recording is valid and `alive` passes
- **THEN** `README.md` SHALL contain a Markdown link or video reference pointing to `docs/demo/end-to-end.mp4`
