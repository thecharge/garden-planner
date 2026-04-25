## MODIFIED Requirements

### Requirement: Sector creation accepts an optional ScanProtocol pre-fill

The sector creation flow SHALL accept an optional `ScanProtocol` pre-fill bag containing `slopeDegree` and `orientationDegrees`. When provided, these values SHALL be stored on the sector record and displayed in the sector detail view as read-only topographic context.

#### Scenario: Sector created without a scan (existing behaviour preserved)

- **WHEN** the user creates a sector from the Sectors tab FAB without a scan
- **THEN** the sector SHALL be saved with no topographic metadata
- **AND** the existing name-input flow SHALL remain unchanged

#### Scenario: Sector created from a scan protocol

- **WHEN** the user confirms "Create sector from this scan" after a successful capture
- **THEN** `useSaveSector` SHALL be called with the sector name and the protocol's `slopeDegree` and `orientationDegrees`
- **AND** the saved sector record SHALL include those topographic values

#### Scenario: Sector detail shows topographic metadata when present

- **WHEN** a sector was created from a scan
- **THEN** the sector detail screen SHALL display the slope and orientation as read-only fields
- **AND** these fields SHALL have `accessibilityLabel` values so TalkBack can announce them
