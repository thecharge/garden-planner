## ADDED Requirements

### Requirement: Jest coverage thresholds enforced per package

Each package's `jest.config.cjs` SHALL declare a `coverageThreshold` of at minimum 70 % lines and 80 % functions. CI SHALL fail if thresholds are not met.

#### Scenario: Coverage gate blocks merge when below threshold

- **WHEN** a change removes tests or reduces coverage below 70 % lines in any package
- **THEN** `pnpm test:coverage` SHALL exit non-zero

#### Scenario: All packages pass threshold on green main

- **WHEN** `pnpm test:coverage` is run on the main branch with all new test files present
- **THEN** every package SHALL report lines ≥ 70 % and functions ≥ 80 %

### Requirement: settings-screen has a Jest it.each test table

`apps/mobile/src/features/settings/__tests__/settings-screen.test.tsx` SHALL exist with `it.each` cases covering: renders without crash, sound toggle changes store, permissions card visible.

#### Scenario: Settings screen test file exists and passes

- **WHEN** `pnpm --filter apps-mobile run test` is run
- **THEN** `settings-screen.test.tsx` SHALL pass all cases

### Requirement: capture-permissions-card has a Jest test

`apps/mobile/src/features/settings/__tests__/permissions-card.test.tsx` SHALL exist with cases covering: permissions granted shows labels, permissions denied shows manage button, AppState change refreshes status.

#### Scenario: Permissions card test file exists and passes

- **WHEN** `pnpm --filter apps-mobile run test` is run
- **THEN** `permissions-card.test.tsx` SHALL pass all cases

### Requirement: home-dashboard has a Jest test

`apps/mobile/src/features/capture/__tests__/home-dashboard.test.tsx` (or appropriate path) SHALL exist with cases: renders hero CTA, shows no-sectors prompt when empty, shows last-scan card when protocol exists.

#### Scenario: Home dashboard test file exists and passes

- **WHEN** `pnpm --filter apps-mobile run test` is run
- **THEN** the home-dashboard test SHALL pass all cases

### Requirement: capture-to-sector flow has an integration test

A test SHALL cover the full capture → create-sector bottom sheet flow: scanning produces a protocol, tapping CTA opens sheet, confirming calls useSaveSector with protocol metadata.

#### Scenario: Capture to sector integration test passes

- **WHEN** `pnpm --filter apps-mobile run test` is run
- **THEN** the capture-to-sector test SHALL pass the happy path and the cancel path
