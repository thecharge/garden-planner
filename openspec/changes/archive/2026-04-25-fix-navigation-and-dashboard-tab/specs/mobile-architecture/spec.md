## MODIFIED Requirements

### Requirement: App root navigates into the tabs group

The system SHALL redirect from the root route (`/`) into the tabs group so that the tab bar is visible immediately on launch. The root index route SHALL NOT render any screen content directly; it SHALL issue a synchronous redirect to `/(tabs)/home`.

#### Scenario: Root route redirects to home tab

- **WHEN** the app mounts at route `/`
- **THEN** it immediately navigates to `/(tabs)/home` with no visible intermediate screen

#### Scenario: All feature tabs reachable from any tab

- **WHEN** the user is on any tab (including Home)
- **THEN** tapping any other tab in the tab bar navigates to that tab's screen

### Requirement: Fonts loaded before first render

The system SHALL load the Lexend and OpenDyslexic font files before hiding the splash screen, so that text primitives render with the correct font on every launch, including cold starts.

#### Scenario: Splash visible until fonts ready

- **WHEN** the app is launched cold
- **THEN** the splash screen remains visible until both Lexend and OpenDyslexic fonts are confirmed loaded by `useFonts`

#### Scenario: App renders without font fallback flash

- **WHEN** fonts have been loaded successfully
- **THEN** all text renders with the configured font from the first visible frame; no system-font fallback flash occurs
