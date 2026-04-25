## ADDED Requirements

### Requirement: Button accessibilityLabel is required

The `GardenButtonProps` interface in `@garden/ui` SHALL declare `accessibilityLabel` as a required `string` property (no `?` modifier). Any component that renders a `GardenButton` without providing `accessibilityLabel` SHALL produce a TypeScript compile error.

#### Scenario: Omitting accessibilityLabel fails typecheck

- **WHEN** a developer renders `<GardenButton onPress={fn} mode="primary">Label</GardenButton>` without passing `accessibilityLabel`
- **THEN** `tsc` SHALL emit a type error stating the property is missing

#### Scenario: Providing accessibilityLabel compiles cleanly

- **WHEN** a developer renders `<GardenButton onPress={fn} mode="primary" accessibilityLabel="Save plant">Label</GardenButton>`
- **THEN** `tsc` SHALL produce no errors for that usage

#### Scenario: Pressable receives the label at runtime

- **WHEN** `GardenButton` is rendered with `accessibilityLabel="Confirm"`
- **THEN** the underlying `Pressable` SHALL have `accessibilityLabel="Confirm"` in the rendered output
