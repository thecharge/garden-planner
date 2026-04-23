# yield-tracking Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.
## Requirements
### Requirement: Plots are subdivided into named sectors

The system SHALL allow a user to subdivide a plot into one or more named sectors (beds, rows, greenhouse zones) with a polygon geometry and a stable `sectorId`. Sector CRUD MUST be a pure-function operation over `MemoryRepository`.

#### Scenario: Create a sector

- **WHEN** the user creates a sector named "North Bed" with a 4-corner polygon on Plot A
- **THEN** a `Sector` record with `{ id, plotId, name: "North Bed", polygon, createdAt }` MUST be persisted
- **AND** the sector MUST be listable via `listSectorsByPlot(plotId)`

#### Scenario: Rename a sector preserves history

- **WHEN** a sector is renamed from "North Bed" to "Greenhouse North"
- **THEN** its `id` MUST remain stable
- **AND** existing harvest and planting records tied to the old name MUST remain attached via `sectorId`

### Requirement: What-was-seeded-where, with audit trail

The system SHALL record every sowing and transplanting event against a sector and a species, time-stamped and append-only. Queries MUST be able to return, for any sector and any year, the exact list of what was planted there.

#### Scenario: Log a sowing on a sector

- **WHEN** the user logs `EventKind.SOWED` for `{ sectorId: "north-bed", speciesId: "tomato-san-marzano", quantity: 20, sowedAt: "2026-04-15" }`
- **THEN** the event MUST be persisted via `appendEvent`
- **AND** `listPlantingsBySector("north-bed", { year: 2026 })` MUST include the entry

#### Scenario: Historical query by sector and year

- **WHEN** the user asks "what did I plant in the north bed in 2025?"
- **THEN** the result MUST list every `SOWED` / `TRANSPLANTED` event for that `sectorId` whose timestamp falls in calendar year 2025
- **AND** each entry MUST include `speciesId`, `quantity`, and `sowedAt`

### Requirement: Harvest logging and year-over-year yield

The system SHALL record harvests per sector with weight (grams) and timestamp, and SHALL expose an aggregate view that compares per-sector yield across calendar years.

#### Scenario: Record a harvest

- **WHEN** the user records a 4,200 g tomato harvest from the north bed on 2026-08-12
- **THEN** a `Harvest` record `{ sectorId: "north-bed", speciesId: "tomato-san-marzano", weightGrams: 4200, harvestedAt: "2026-08-12T..." }` MUST be persisted
- **AND** `yieldBySectorAndYear("north-bed", 2026)` MUST include 4200 g under `tomato-san-marzano`

#### Scenario: Year-over-year comparison

- **WHEN** the user opens the yield view for the north bed
- **THEN** the UI MUST show total grams per species per calendar year for every year in which a harvest was logged
- **AND** the data MUST come from a pure aggregation function in `@garden/engine` (testable in Node, no UI dependency)

### Requirement: Sector heatmap of productivity

The system SHALL render a heatmap of sectors coloured by yield relative to a user-chosen baseline (e.g., grams per m² per year). The colour scale MUST meet WCAG AA and MUST include a non-colour redundancy (numeric label on every sector tile) per the accessibility capability.

#### Scenario: Heatmap shows relative productivity

- **WHEN** the user opens the plot heatmap for a given year
- **THEN** each sector tile MUST be coloured on a scale from the theme's muted-low to muted-high pastel pair
- **AND** each tile MUST display the numeric yield value as a caption beneath the tile

#### Scenario: No data is a muted, labelled tile

- **WHEN** a sector has no harvests in the selected year
- **THEN** the tile MUST render in the theme's neutral "no-data" tone
- **AND** MUST display the label "no data"

### Requirement: Yield data is exportable and offline-readable

The system SHALL allow the user to export sector + harvest data to a local CSV file on-device so they can take the history off the phone without a network. The export MUST include every field used to compute the yield view.

#### Scenario: Export CSV

- **WHEN** the user taps "Export yield history"
- **THEN** a CSV with columns `sectorId, sectorName, year, speciesId, totalWeightGrams, harvestCount` MUST be written to the device's shared storage
- **AND** the file path MUST be surfaced to the user with a "share" action

### Requirement: Aggregation lives in the pure engine

The system SHALL implement `yieldBySectorAndYear`, `plantingsBySectorAndYear`, and `heatmapData` as pure functions in `@garden/engine` that take `MemoryRepository` (or its query results) as input. No RN or `expo-*` module MAY be imported by these functions.

#### Scenario: Aggregation runs in pure Node tests

- **WHEN** Jest tests the aggregation functions with in-memory fixtures
- **THEN** the tests MUST pass without loading `expo-*`
- **AND** MUST cover happy / side / critical / chaos (empty history, partial-year, year-boundary harvest, negative weight → throws `SmepErrors.invalidHarvestWeight()`)

### Requirement: Harvest log form on sector detail

The sector detail screen at `/sector/[id]` SHALL expose a harvest-log form composed of `@garden/ui` primitives. The form MUST collect:

1. **Species** — a single-choice row of `Button` pills seeded from the curated species list in `@garden/engine`. Required.
2. **Weight (grams)** — `TextInput` with `keyboardType: 'numeric'`. Required, >0. The label MUST explicitly name the unit so the user is not left guessing.
3. **Submit** — a `Button` that, on press, calls `MemoryRepository.appendHarvest({ sectorId, speciesId, grams, harvestedAt })` and resets the form on success.

Submission MUST be blocked in-UI when `speciesId` or `grams` is unset or non-positive, surfacing a `Caption` variant `actionRequired` with a plain-language prompt ≤20 words.

The Yield tab — `apps/mobile/src/features/yield/components/yield-screen.tsx` — SHALL re-render with the new harvest row within one Tanstack-query invalidation cycle after submission. No manual refresh MUST be required.

#### Scenario: Log a tomato harvest from sector detail

- **GIVEN** the user is on `/sector/s-1`
- **WHEN** the user picks species `tomato-detvan`, types `1250` grams, and taps Submit
- **THEN** `appendHarvest` MUST be called with `{ sectorId: 's-1', speciesId: 'tomato-detvan', grams: 1250, harvestedAt: <iso-now> }`
- **AND** the Yield tab list MUST show the new row without a restart

#### Scenario: Non-positive weight is rejected

- **WHEN** the user taps Submit with grams empty or `0`
- **THEN** `appendHarvest` MUST NOT be called
- **AND** a `Caption` variant `actionRequired` MUST read "Weight must be greater than zero"

#### Scenario: No species picked is rejected

- **WHEN** the user taps Submit with no species selected
- **THEN** `appendHarvest` MUST NOT be called
- **AND** a `Caption` variant `actionRequired` MUST read "Pick a species"

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

