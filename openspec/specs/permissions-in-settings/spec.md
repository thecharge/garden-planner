## ADDED Requirements

### Requirement: Settings screen shows camera and location permission status

The Settings screen SHALL include a "Camera & Location" card that displays the current permission status (granted / denied / not-yet-requested) for camera, location, and device motion.

#### Scenario: Permissions granted — card shows green status

- **WHEN** all three permissions are granted
- **THEN** the card SHALL display each permission as "Granted"
- **AND** no action button SHALL be shown

#### Scenario: Permissions not granted — card shows manage button

- **WHEN** one or more permissions are not granted
- **THEN** the card SHALL show each missing permission labelled "Not granted"
- **AND** a "Manage permissions" button SHALL be present

#### Scenario: Permission status refreshes on AppState change

- **WHEN** the user returns to the app after visiting OS Settings
- **THEN** the permissions card SHALL re-query current status and update labels without requiring a full app restart

### Requirement: Manage permissions button routes to rationale screen or OS settings

The "Manage permissions" button SHALL navigate to the in-app permissions rationale screen when permissions can still be requested, or call `Linking.openSettings()` when the OS has permanently denied them.

#### Scenario: Permissions can still be requested

- **WHEN** at least one permission has status "undetermined"
- **THEN** tapping "Manage permissions" SHALL navigate to `/capture/permissions`

#### Scenario: Permissions permanently denied

- **WHEN** a permission has been permanently denied by the OS
- **THEN** tapping "Manage permissions" SHALL open the device OS settings via `Linking.openSettings()`
- **AND** the button SHALL be labelled "Open device settings"
