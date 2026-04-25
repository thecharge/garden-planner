## ADDED Requirements

### Requirement: Selecting a font in Settings immediately changes the app-wide font

The system SHALL apply the user's chosen font family to all text primitives across the app immediately upon selection, without requiring an app restart.

#### Scenario: Switch to OpenDyslexic

- **GIVEN** the app is using the default Lexend font
- **WHEN** the user selects "OpenDyslexic" in Settings
- **THEN** all text rendered by `Body`, `Heading`, `Caption`, and `Button` primitives uses the OpenDyslexic font

#### Scenario: Switch back to Lexend

- **GIVEN** the app is using OpenDyslexic
- **WHEN** the user selects "Lexend" in Settings
- **THEN** all text rendered by the primitives returns to Lexend

#### Scenario: Font preference persists across tab navigation

- **GIVEN** the user has selected OpenDyslexic
- **WHEN** the user navigates to any other tab and back
- **THEN** the font remains OpenDyslexic throughout

### Requirement: `ThemeProvider` supports a runtime font override

The `ThemeProvider` in `@garden/ui` SHALL accept an optional `fontFamilyOverride` prop. When provided, the active token set SHALL use that font family for `typography.bodyFontFamily` instead of the static default.

#### Scenario: Override supplied

- **WHEN** `ThemeProvider` is rendered with `fontFamilyOverride={FontFamily.OpenDyslexic}`
- **THEN** all consumers of the tokens context read `typography.bodyFontFamily === FontFamily.OpenDyslexic`

#### Scenario: No override supplied (backwards compatibility)

- **WHEN** `ThemeProvider` is rendered without `fontFamilyOverride`
- **THEN** all consumers read the theme's default `typography.bodyFontFamily` unchanged
