## ADDED Requirements

### Requirement: captureProtocol accepts AbortSignal

`CaptureProtocolInput` SHALL include an optional `signal?: AbortSignal` field. When provided, `captureProtocol` SHALL check `signal.aborted` before subscribing to DeviceMotion and again after the `windowMs` sleep. If aborted at either check point, the protocol SHALL call `unsubscribe()` (if a subscription exists) and return without completing the scan.

#### Scenario: Abort before subscription skips DeviceMotion entirely

- **WHEN** `captureProtocol` is called with a pre-aborted signal
- **THEN** `deps.motion.subscribe` SHALL NOT be called
- **THEN** the function SHALL return without producing a scan result

#### Scenario: Abort during sleep tears down subscription

- **WHEN** `captureProtocol` is mid-sleep and `signal.aborted` becomes `true`
- **THEN** after the sleep completes, `unsubscribe()` SHALL be called
- **THEN** the function SHALL return without producing a scan result

#### Scenario: No signal follows existing behaviour

- **WHEN** `captureProtocol` is called without a `signal` field
- **THEN** the protocol SHALL behave identically to the pre-change implementation

### Requirement: CaptureScreen aborts captureProtocol on tab blur

`CaptureScreen` SHALL create an `AbortController` when `onScan` fires and pass its `signal` to `captureProtocol`. A `useEffect` keyed on `isFocused` SHALL call `controller.abort()` when `isFocused` transitions to `false` while a scan is in progress.

#### Scenario: Tab loses focus mid-scan

- **WHEN** a scan is started via `onScan`
- **AND** the tab loses focus before the scan completes
- **THEN** the active `AbortController` SHALL have `abort()` called
- **THEN** DeviceMotion subscription SHALL be released before the scan window elapses

#### Scenario: Scan completes normally when tab stays focused

- **WHEN** a scan is started and the tab remains focused for the full `windowMs`
- **THEN** the scan SHALL complete normally and the `AbortController` SHALL not be aborted

#### Scenario: No controller active when tab is not scanning

- **WHEN** the tab blurs but no scan is in progress
- **THEN** no abort SHALL be issued (no controller is active)
