## ADDED Requirements

### Requirement: Yield tab renders a two-column year-over-year comparison

The Yield tab MUST render a two-column table comparing the current
calendar year's yield against the prior year's, per sector and species,
inside `apps/mobile/src/features/yield/components/yield-screen.tsx`. The table MUST
come from `yoyBySectorAndSpecies(repo, plotId, year)` in
`@garden/engine`, a pure function Node-testable without any RN import.

Each row MUST display:

1. **Sector name** (resolved from `sectorId`).
2. **Species id** (curated list from `@garden/engine`).
3. **Current-year grams** (numeric, right-aligned).
4. **Prior-year grams** (numeric, right-aligned, muted when zero).
5. **Delta** (signed grams + percentage).

Rows MUST be sorted by absolute delta descending — the biggest year-
over-year swings surface first. The table MUST meet the accessibility
capability (plain-language headers, ≥18 sp body, non-colour redundancy
— the numeric delta is always visible).

#### Scenario: YoY table shows both years for a sector with harvests in both

- **GIVEN** sector `s-1` has a 2025 harvest of 2000 g and a 2026 harvest of 3500 g for species `tomato-detvan`
- **WHEN** the Yield tab loads with the current year = 2026
- **THEN** the table MUST include a row `{ sectorId: "s-1", speciesId: "tomato-detvan", currentGrams: 3500, priorGrams: 2000, deltaGrams: +1500, deltaPct: +75 }`
- **AND** the row MUST render the delta text "+1500 g (+75%)"

#### Scenario: New-this-year row shows prior as 0 and delta as +100%

- **GIVEN** sector `s-2` has only a 2026 harvest (1000 g) for species `basil-genovese`
- **WHEN** the Yield tab loads
- **THEN** the row MUST show `priorGrams: 0` as muted `—`
- **AND** the delta MUST read "+1000 g (new)"

### Requirement: Rows carry a yield-proportional pastel tint

Each row SHALL render with a background tint proportional to
`currentGrams / maxGrams` across the visible table, using the active
theme's `colors.pastelLow` (≈10% intensity) through `colors.pastelHigh`
(100% intensity). Colour MUST NEVER be the only carrier — the numeric
value is always visible, per the accessibility capability.

#### Scenario: Heaviest row uses pastelHigh, lightest uses pastelLow

- **GIVEN** three rows with current-year grams 500, 1500, 3000
- **WHEN** the table renders
- **THEN** the 3000 g row's background MUST equal `tokens.colors.pastelHigh`
- **AND** the 500 g row's background MUST be interpolated at ~17% of the range between pastelLow and pastelHigh
- **AND** every row MUST still display its numeric value

### Requirement: CSV export button on the Yield tab

The Yield tab SHALL expose an `ExportCsvButton` that, on press, writes
`sectorId,sectorName,year,speciesId,totalWeightGrams,harvestCount`
to `${FileSystem.cacheDirectory}yield-<YYYY>.csv` and opens the share
sheet via `expo-sharing`. The button MUST call `useAnnounce()` on
success and on typed failure.

#### Scenario: Export writes CSV and announces success

- **GIVEN** the Yield tab has loaded with at least one harvest
- **WHEN** the user taps "Export yield history"
- **THEN** `FileSystem.writeAsStringAsync` MUST be called with a header row plus one data row per sector/species
- **AND** `Sharing.shareAsync` MUST be called with the written file URI
- **AND** `announce(summary.success("Exported yield for <year>"))` MUST be called

#### Scenario: Sharing unavailable surfaces actionRequired without crashing

- **GIVEN** `Sharing.isAvailableAsync` resolves to `false`
- **WHEN** the user taps "Export yield history"
- **THEN** the file MUST still be written to cache
- **AND** `announce(summary.actionRequired("Sharing not available. File saved to cache."))` MUST be called
- **AND** the file URI MUST be logged (for debugging, not displayed)
