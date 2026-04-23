# spatial-topography Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.
## Requirements
### Requirement: Camera + sensor capture produces a normalized `Protocol`

The system SHALL capture plot topography by fusing `expo-camera` frames with `expo-sensors` orientation/pitch readings and `expo-location` coordinates, and emit a `Protocol` object conforming to the `@garden/core` schema. The capture function MUST be an async const arrow function that accepts a `CaptureSession` and returns a `Protocol`.

#### Scenario: Pan capture produces a complete Protocol

- **WHEN** the user pans the camera across a slope for at least the minimum capture window
- **THEN** the result MUST be a `Protocol` with `data.slopeDegree`, `data.orientationDegrees`, and a non-empty `id` + `capturedAt`
- **AND** `data.slopeDegree` MUST be the averaged pitch reading across the window, not a single-frame sample

#### Scenario: Short capture is rejected, not silently partial

- **WHEN** the capture window is cut short below the minimum duration
- **THEN** the function MUST throw `SmepErrors.captureTooShort()` from `@garden/config`
- **AND** MUST NOT return a partial `Protocol`

### Requirement: Confidence score on every scan

The system SHALL attach a numeric `confidence` field (0.0–1.0) to every `Protocol` based on sensor noise, capture duration, and GPS accuracy. Downstream consumers (compliance engine, voice whisper) MUST be able to gate behavior on confidence.

#### Scenario: High-confidence scan is marked ready

- **WHEN** sensor variance is below threshold and GPS accuracy is below 5 metres
- **THEN** `confidence` MUST be ≥ 0.8
- **AND** `TaskStatus` MUST advance to `TaskStatus.VERIFIED` eligible

#### Scenario: Low-confidence scan is flagged

- **WHEN** sensor variance exceeds threshold or GPS accuracy is above 15 metres
- **THEN** `confidence` MUST be < 0.5
- **AND** the capture result MUST include a `summary.warning` advising a re-scan before the compliance engine runs

### Requirement: Property-line distance is user-confirmed

The system SHALL require the user to walk or pin the property boundary before `data.distanceToPropertyLine` is populated. Inference-only (no user confirmation) MUST NOT populate this field because legal verdicts depend on it.

#### Scenario: Boundary walked before distance is set

- **WHEN** the user completes a boundary-walk with at least three corner pins
- **THEN** `data.distanceToPropertyLine` MUST be computed as the nearest perpendicular distance from the scan point to the polygon
- **AND** the value MUST be present on the `Protocol`

#### Scenario: No boundary walked yet

- **WHEN** no boundary polygon exists for the active plot
- **THEN** `data.distanceToPropertyLine` MUST be `undefined`
- **AND** any compliance call that depends on it MUST return `summary.actionRequired("Walk the property boundary before requesting a compliance verdict.")`

### Requirement: Live spatial pose bypasses React render cycle

The system SHALL hold live spatial pose samples (position, pitch, yaw, roll) at capture frame-rate (up to 60 Hz) outside React state. The capture driver MUST feed samples into a transient Zustand store (or equivalent non-render-triggering primitive) so that consuming components do not re-render on every sample. Only the batched `Protocol` snapshot emitted at the end of a capture window is permitted to flow through React state paths.

#### Scenario: 60 Hz sampling does not melt the UI

- **WHEN** the capture driver is producing 60 pose samples per second
- **THEN** unthrottled consuming components MUST NOT re-render more than 2 times per second on average
- **AND** the camera preview MUST remain smooth (no dropped frames attributable to JS-thread contention during capture)

#### Scenario: Only the snapshot flows through React

- **WHEN** a capture window completes
- **THEN** exactly one `Protocol` object per window MUST be emitted through the normal React path
- **AND** the live pose stream during the window MUST NOT have been stored in `useState` or in a TanStack Query cache

### Requirement: Pure-core decoupling from rendering

The `@garden/core` capture helpers (Protocol constructors, sensor-fusion math, confidence scoring) MUST NOT import `react-native`, `expo-*`, `@garden/ui`, or any UI library. The Expo-specific capture driver lives in `apps/mobile` and produces the same `Protocol` shape.

#### Scenario: @garden/core compiles and tests pass in pure Node

- **WHEN** `jest` runs the `@garden/core` test suite in a vanilla Node environment
- **THEN** no `expo-*` module MUST be required
- **AND** all unit tests for Protocol construction and confidence scoring MUST pass

### Requirement: Scan is gated behind a permissions rationale route

The Capture tab SHALL route the user through
`app/capture/permissions.tsx` when camera, location, or motion
permission is `undetermined` or `denied`. The Scan button MUST be
disabled in this state and a `Caption` variant `actionRequired` MUST
link to the rationale route. Once all three are `granted`, the Scan
button MUST re-enable without a restart.

#### Scenario: First launch requires all three permissions

- **GIVEN** a freshly installed app with no permissions granted
- **WHEN** the user opens the Capture tab
- **THEN** the Scan button MUST be disabled
- **AND** a `Caption` variant `actionRequired` MUST read "Grant camera, location, and motion access to scan"
- **AND** tapping the caption MUST navigate to `/capture/permissions`

#### Scenario: Permissions granted unlocks Scan without a restart

- **GIVEN** the user is on `/capture/permissions`
- **WHEN** all three `expo-camera` / `expo-location` / `expo-sensors` permission requests resolve to `granted`
- **THEN** the Capture tab MUST re-render with the Scan button enabled
- **AND** no app restart MUST be required

#### Scenario: Revoked permission while app is backgrounded re-gates Scan

- **GIVEN** all three permissions were granted
- **WHEN** the user revokes the camera permission in system settings and returns to the app
- **THEN** on `AppState` change to `active`, the Scan button MUST re-disable
- **AND** the `actionRequired` caption MUST return

### Requirement: Capture driver emits a real Protocol from sensor fusion

`apps/mobile/src/engine/capture-driver.ts` SHALL export
`captureProtocol(opts: CaptureOptions): Promise<Protocol>`. The driver
MUST subscribe to `DeviceMotion` for `config.CAPTURE_WINDOW_MS`, compute
`data.slopeDegree` as the mean absolute pitch across the window, read
`data.orientationDegrees` as the mean heading, and read one location fix
(cached up to `config.CAPTURE_LOCATION_CACHE_MS`). The returned
`Protocol` MUST NOT contain hardcoded values — any field not derivable
from sensors MUST be `undefined` so the compliance engine routes the user
to `summary.actionRequired` for confirmation.

#### Scenario: Scan produces a real Protocol, not a placeholder

- **WHEN** the user taps Scan with all permissions granted
- **THEN** `captureProtocol` MUST run for at least `CAPTURE_WINDOW_MS`
- **AND** the emitted `Protocol.data.slopeDegree` MUST be computed from the live motion samples — not a fixed constant
- **AND** the emitted `Protocol.data.distanceToPropertyLine` MUST be `undefined` unless the user has tapped the property-line pin beforehand
- **AND** the emitted `Protocol.data.waterTableDepth` MUST be `undefined` (we do not infer it)

#### Scenario: Missing location still produces a Protocol

- **GIVEN** `getLastKnownPositionAsync` returns null AND `getCurrentPositionAsync` times out after 3 s
- **WHEN** the capture window completes
- **THEN** `captureProtocol` MUST resolve with a `Protocol`
- **AND** the emitted `Protocol.location` MUST be `undefined`
- **AND** the compliance call MUST NOT throw on missing location — it MUST route to `summary.actionRequired("Pin your plot location before a compliance verdict.")`

### Requirement: Property-line distance is user-set on the Capture screen

The Capture screen SHALL expose a "Pin property line" action that lets
the user tap the current distance to the nearest property line (plain
numeric input, metres, required >0). The value MUST be persisted per plot
in `MemoryRepository` so the same plot reuses it across sessions.

#### Scenario: User pins distance and it persists

- **WHEN** the user taps "Pin property line" and enters `3.5` metres
- **THEN** the value MUST be saved to the plot record via `MemoryRepository`
- **AND** the next `captureProtocol` call for the same plot MUST populate `data.distanceToPropertyLine = 3.5`
- **AND** the UI MUST show the current pinned value as a caption beneath the Viewfinder

