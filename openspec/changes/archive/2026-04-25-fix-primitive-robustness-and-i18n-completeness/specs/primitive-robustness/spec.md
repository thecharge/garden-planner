## ADDED Requirements

### Requirement: Primitive and feature tests use valid typed element lookups

The system SHALL keep `react-test-renderer` test files type-safe under current TypeScript and React Native typings by using valid component references or typed helpers instead of string host names for React Native primitives.

#### Scenario: UI primitive render test resolves `Text` by component reference

- **WHEN** `packages/ui/src/primitives/__tests__/render.test.tsx` queries rendered React Native text primitives
- **THEN** the test MUST call `findByType(Text)` or an equivalent typed helper rather than `findByType("Text")`
- **AND** `pnpm --filter @garden/ui run typecheck` MUST not report TS2345 for that file

#### Scenario: Mobile feature tests resolve primitive components without string host names

- **WHEN** the affected mobile tests in `apps/mobile/src/features/sectors/__tests__/sectors-screen.test.tsx`, `apps/mobile/src/features/sectors/__tests__/sector-detail-screen.test.tsx`, `apps/mobile/src/features/settings/__tests__/anthropic-key-field.test.tsx`, `apps/mobile/src/features/inventory/__tests__/event-form.test.tsx`, `apps/mobile/src/features/inventory/__tests__/record-form.test.tsx`, and `apps/mobile/src/features/yield/__tests__/harvest-form.test.tsx` query React Native primitives
- **THEN** those tests MUST use component references or a shared typed helper instead of string literal element names
- **AND** `pnpm --filter apps-mobile run typecheck` MUST not report the `ElementType` mismatch for those files

### Requirement: Home dashboard test constructs Card children with typed props

The system SHALL keep the home dashboard test compatible with the `createElement` overloads accepted by current TypeScript React typings by passing `children` through the props object or through a typed wrapper.

#### Scenario: Home dashboard card element compiles under TS2769 rules

- **WHEN** `apps/mobile/src/features/overlay/__tests__/home-dashboard.test.tsx` creates a `Card` element for test rendering
- **THEN** the test MUST provide `children` in a type-safe form accepted by `createElement`
- **AND** `pnpm --filter apps-mobile run typecheck` MUST not report TS2769 for that file

### Requirement: Paper theme letter spacing preserves em token semantics

The system SHALL convert typography tokens expressed as `letterSpacingEm` into React Native `letterSpacing` units by multiplying the token by the resolved font size before sending values into the Paper theme adapter.

#### Scenario: Paper body typography converts em token to React Native unit

- **WHEN** `packages/ui/src/theme/paper-theme.ts` builds a Paper font config from tokens where `letterSpacingEm` is `0.02` and `fontSize` is `18`
- **THEN** the resulting `letterSpacing` value MUST be `0.36`
- **AND** the adapter MUST not pass the raw `0.02` value through as pixel spacing

### Requirement: UI package Jest environment mocks expo-font for ThemeProvider consumers

The system SHALL provide an `expo-font` Jest mock in `@garden/ui` so tests that render `packages/ui/src/primitives/theme-provider.tsx` or other font-aware primitives can run without depending on the native Expo font module.

#### Scenario: Theme provider test bootstraps without native expo-font implementation

- **WHEN** `@garden/ui` tests execute in Jest with the package-local config
- **THEN** imports from `expo-font` used by font-aware providers or wrappers MUST resolve to a deterministic mock
- **AND** the test run MUST not fail because the real native module is unavailable in the Node test environment
