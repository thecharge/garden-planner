## ADDED Requirements

### Requirement: HomeDashboard renders as a tab with persistent bottom tab bar

The system SHALL render `HomeDashboard` as a route within the `(tabs)` group so that the bottom tab bar is visible while the dashboard is active.

#### Scenario: Tab bar visible on launch

- **WHEN** the app launches for the first time
- **THEN** the bottom tab bar is visible and "Home" is the active tab

#### Scenario: Home tab shows dashboard content

- **WHEN** the user is on the Home tab
- **THEN** the screen renders a prominent primary scan CTA, a metric tiles row (sector count + last slope), a quick-link row, and (if not dismissed) the sound onboarding card below the primary content

#### Scenario: Home tab icon present

- **WHEN** the tab bar is rendered
- **THEN** a "Home" tab with a home icon appears as the first tab

### Requirement: HomeDashboard is visually distinct from the Settings screen

The system SHALL render `HomeDashboard` with a visual structure that is clearly different from the Settings screen. The dashboard SHALL prioritize action and data summary over configuration controls.

#### Scenario: Primary CTA is the dominant element

- **WHEN** the user opens the Home tab
- **THEN** the primary scan call-to-action button is the most visually prominent interactive element, not contained within a uniform Card alongside other controls

#### Scenario: Metrics displayed as emphasized numbers

- **WHEN** the user has one or more sectors
- **THEN** sector count and last recorded slope are displayed as emphasized metric values, not as plain paragraph text

#### Scenario: Sound onboarding card not the first visible element

- **WHEN** the sound onboarding card has not been dismissed
- **THEN** it appears below the primary CTA and metric tiles, not at the top of the screen

#### Scenario: Quick-link row present

- **WHEN** the Home tab is rendered
- **THEN** a row of quick-link buttons (Capture, Sectors, Yield, Settings) is visible to signal hub navigation
