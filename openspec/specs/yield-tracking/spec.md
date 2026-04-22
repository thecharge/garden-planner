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

