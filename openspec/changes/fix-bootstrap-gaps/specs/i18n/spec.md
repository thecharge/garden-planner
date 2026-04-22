## ADDED Requirements

### Requirement: i18next initialisation

The mobile app SHALL initialise `i18next` + `react-i18next` once, at app startup, reading the device locale via `expo-localization`. The setup MUST live in `apps/mobile/src/core/i18n/index.ts` and be imported (side-effect) from `app/_layout.tsx`.

#### Scenario: App boots under English
- **WHEN** the device locale is any variant of `en-*`
- **THEN** `i18n.language` MUST resolve to `en`
- **AND** `t("settings.title")` MUST return the English value from `locales/en.ts`

#### Scenario: App boots under Bulgarian
- **WHEN** the device locale is `bg-BG`
- **THEN** `i18n.language` MUST resolve to `bg`
- **AND** `t("settings.title")` MUST return the BG mirror value (currently the EN text, per this change's stub-only policy)

#### Scenario: Unsupported locale falls back to English
- **WHEN** the device locale is `fr-FR` or any unsupported locale
- **THEN** `i18n.fallbackLng` MUST be `en`
- **AND** no missing-key warnings MUST appear

### Requirement: Locale files are TypeScript and share a common key shape

Every locale under `apps/mobile/src/core/i18n/locales/` SHALL export a `Translations` object whose shape is structurally identical across locales. A shared TypeScript type `TranslationKeys` derived from the English locale SHALL be used to type every other locale.

#### Scenario: Missing key in BG fails typecheck
- **WHEN** a developer adds a key to `en.ts` but forgets to mirror it in `bg.ts`
- **THEN** `pnpm --filter apps-mobile run typecheck` MUST fail

#### Scenario: BG stubs mirror EN text
- **WHEN** a BG key has not yet been translated
- **THEN** its value MUST equal the EN value
- **AND** the entry MUST carry a `// TODO(bg): native translation needed` comment for the translator to find

### Requirement: User-facing strings in feature code go through `t(...)`

New user-facing strings added under `apps/mobile/src/features/` SHALL go through `useTranslation()` + `t(key)`. Raw JSX text children that are string literals in feature components SHALL warn in lint.

#### Scenario: Literal JSX text in a feature component warns
- **WHEN** a feature component renders `<Text>Settings</Text>`
- **THEN** lint MUST produce a warning guiding the developer toward `t("settings.title")`
- **AND** the warning MUST NOT apply to `app/` glue files or development-only notices

### Requirement: Translator sign-off ledger

`ACCESSIBILITY.md` SHALL gain a Bulgarian-translator sign-off row alongside the existing a11y reviewer ledger. Public release SHALL remain blocked until a named translator has reviewed at least the top-level labels (capture / sectors / yield / rotation / nutrient / inventory / settings).

#### Scenario: Release blocked without BG translator row
- **WHEN** the team attempts to tag a public release
- **THEN** the release checklist MUST call out the empty BG row
- **AND** the release MUST NOT be tagged public until a translator is recorded
