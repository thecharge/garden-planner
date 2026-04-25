## ADDED Requirements

### Requirement: Capture verdict screen offers "Create sector from this scan" CTA

After a successful scan produces a compliance verdict, the capture screen SHALL display a primary call-to-action button labelled "Create sector from this scan".

#### Scenario: CTA appears after successful scan

- **WHEN** a scan completes and a Protocol with a non-null slopeDegree is produced
- **THEN** the verdict card SHALL contain a "Create sector from this scan" button

#### Scenario: CTA opens a name-edit bottom sheet pre-populated from protocol

- **WHEN** the user taps "Create sector from this scan"
- **THEN** a bottom sheet SHALL open with a name field pre-filled to "Scan YYYY-MM-DD" (today's date)
- **AND** the sheet SHALL display the captured slope and orientation as read-only context

#### Scenario: Confirming the sheet creates a sector

- **WHEN** the user confirms the name and taps "Create sector"
- **THEN** a new sector SHALL be saved via `useSaveSector`
- **AND** the sector's metadata SHALL include the scan protocol's slopeDegree and orientationDegrees
- **AND** an announce SHALL fire confirming the sector was created
- **AND** the bottom sheet SHALL close

#### Scenario: Cancelling the sheet discards without creating a sector

- **WHEN** the user taps "Cancel" on the bottom-sheet
- **THEN** no sector SHALL be created
- **AND** the capture screen SHALL remain in the post-scan state

### Requirement: Sectors tab FAB includes "Scan new sector" shortcut

The Sectors screen FAB (or toolbar) SHALL include a secondary action "Scan new sector" that deep-links directly to the Capture tab viewfinder with the viewfinder pre-opened.

#### Scenario: Shortcut opens viewfinder

- **WHEN** the user taps "Scan new sector" in the Sectors tab
- **THEN** the app SHALL navigate to the Capture tab
- **AND** the viewfinder SHALL open immediately (equivalent to tapping "Open viewfinder")
