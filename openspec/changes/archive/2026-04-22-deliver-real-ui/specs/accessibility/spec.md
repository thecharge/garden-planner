## ADDED Requirements

### Requirement: Every feature screen is built from `@garden/ui` primitives

Every screen under `apps/mobile/src/features/*/components/*-screen.tsx` SHALL compose its layout from primitives exported by `@garden/ui` (`Screen`, `Heading`, `Body`, `Caption`, `Button`, `Card`, `ListItem`). Raw `react-native` `View` / `Text` MAY be used for layout glue (flex containers) but MUST NOT be used for user-facing text — text always goes through `Heading` / `Body` / `Caption` so Lexend, color, line height, and `accessibilityRole` are applied consistently.

#### Scenario: Each screen renders through `@garden/ui`

- **WHEN** any tab is opened
- **THEN** the screen tree MUST contain a `Screen` primitive at the root
- **AND** every user-facing text node MUST be a `Heading`, `Body`, or `Caption`

### Requirement: Component test mounts every screen

Every screen SHALL have a React component test that mounts it inside `<SafeAreaProvider>` + `<ThemeProvider>` + `<QueryProvider>` without throwing. The test MUST assert at least one screen-specific `accessibilityLabel` or `accessibilityRole="header"` text is present.

#### Scenario: `capture` screen test

- **WHEN** the Capture screen is rendered inside the provider wrapper
- **THEN** the render MUST NOT throw
- **AND** the tree MUST contain the string "Scan the slope" on a header-role element

#### Scenario: All 7 screens have tests

- **WHEN** `pnpm --filter apps-mobile run test` runs
- **THEN** the suite MUST include a test file per screen (`capture.test.tsx`, `sectors.test.tsx`, `yield.test.tsx`, `rotation.test.tsx`, `nutrient.test.tsx`, `inventory.test.tsx`, `settings.test.tsx`)
- **AND** all MUST pass
