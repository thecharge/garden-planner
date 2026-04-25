## ADDED Requirements

### Requirement: All user-facing docs use only approved plain-language terms

`README.md`, `HOW-TO.md`, and `docs/STATUS.md` SHALL NOT contain the following developer terms without a plain-language equivalent immediately following in parentheses: "Protocol", "FAO-56 Penman-Monteith ET₀", "DeviceMotion", "BYOK", "Liebig amendments", "Reanimated worklet", "Skia overlay", "Zustand", "TanStack Query", "MemoryRepository", "local-first".

#### Scenario: README contains no unexplained jargon

- **WHEN** `README.md` is read by a non-technical grower
- **THEN** every user-facing section SHALL use only the approved plain-language mappings defined in the design document
- **AND** developer-only terms SHALL NOT appear in the feature list or opening paragraphs

### Requirement: README includes honest data-persistence caveat

`README.md` SHALL clearly state that app data is currently stored in memory and is lost when the app is reinstalled, until persistent storage ships.

#### Scenario: Data caveat is present

- **WHEN** `README.md` is opened
- **THEN** a note SHALL appear in the features or limitations section stating that data resets on reinstall

### Requirement: Demo video placeholder is user-friendly

The `<!-- TODO: add 30-second demo video -->` comment in `README.md` SHALL be replaced with visible text reading "Video coming soon" so readers see a clear message rather than an invisible HTML comment.

#### Scenario: Video placeholder is visible

- **WHEN** `README.md` is rendered on GitHub
- **THEN** the user SHALL see "Video coming soon" text, not a blank gap

### Requirement: docs/STATUS.md opens with a plain-language summary

A "What works today" paragraph in plain language SHALL appear at the very top of `docs/STATUS.md`, before the developer ground-truth tables.

#### Scenario: Grower-readable summary at top of STATUS.md

- **WHEN** `docs/STATUS.md` is opened
- **THEN** the first content block SHALL be a plain-language paragraph (no technical jargon) summarising what the app can do today
- **AND** all existing developer table rows SHALL remain unchanged below it
