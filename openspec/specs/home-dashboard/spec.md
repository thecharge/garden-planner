## ADDED Requirements

### Requirement: Home screen shows a live dashboard instead of a blank redirect

The app's root index route (`app/index.tsx`) SHALL render a dashboard screen with live data rather than immediately redirecting to the Capture tab.

#### Scenario: Dashboard renders with at least one data card

- **WHEN** the app loads
- **THEN** the home screen SHALL display a hero "Tap to scan" card as the primary action
- **AND** a sector-health summary card showing the count of sectors and the most recent harvest date
- **AND** a rotation nudge card if any sector has a rotation recommendation pending

#### Scenario: Dashboard with no sectors shows onboarding prompt

- **WHEN** no sectors have been created yet
- **THEN** the sector-health card SHALL display "No sectors yet — add one from the Sectors tab"

#### Scenario: Last scan card appears after a scan has been performed

- **WHEN** at least one Protocol has been captured in the current session
- **THEN** the dashboard SHALL display a "Last scan" summary card with the slope and verdict from the most recent scan

### Requirement: Hero "Tap to scan" CTA on dashboard navigates to Capture

The home dashboard SHALL display a prominent button labelled "Tap to scan" that navigates the user to the Capture tab and opens the viewfinder.

#### Scenario: Hero CTA navigates to capture viewfinder

- **WHEN** the user taps "Tap to scan" on the dashboard
- **THEN** the Capture tab SHALL become active
- **AND** the viewfinder SHALL open (identical behaviour to tapping "Open viewfinder" from Capture)

### Requirement: Dashboard is accessible and labelled

Every card on the dashboard SHALL have a unique `accessibilityLabel` so TalkBack can identify and navigate between them.

#### Scenario: TalkBack enumerates dashboard cards

- **WHEN** TalkBack is active and the dashboard is focused
- **THEN** each card SHALL be announced with its accessibilityLabel
