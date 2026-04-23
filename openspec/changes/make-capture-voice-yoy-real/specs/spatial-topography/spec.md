## ADDED Requirements

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
