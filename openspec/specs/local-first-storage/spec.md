# local-first-storage Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.

## Requirements

### Requirement: Offline-first persistence

The system SHALL persist every user artifact (plot scans, inventory, events, settings) to on-device SQLite so that every core workflow functions with no network connectivity. No capability MAY require a network round-trip to read or write local state.

#### Scenario: Save and retrieve a plot scan offline

- **WHEN** the device is in airplane mode and a `Protocol` scan is saved via `MemoryRepository.saveProtocol`
- **THEN** the record MUST be durably written to SQLite
- **AND** a subsequent `MemoryRepository.getProtocol(id)` MUST return the identical record with `capturedAt` preserved

#### Scenario: Repository unavailable error is thrown from the factory

- **WHEN** the SQLite file cannot be opened (missing permissions or corrupted DB)
- **THEN** `MemoryRepository` operations MUST throw `SmepErrors.repositoryUnavailable()` from `@garden/config`
- **AND** MUST NOT throw a bare `new Error(...)`

### Requirement: Canonical `Protocol` and `TaskStatus` contracts

The system SHALL treat `Protocol` (from `@garden/core`) as the single canonical scan object across all packages, and `TaskStatus` (from `@garden/config`) as the single canonical lifecycle enum. Packages MUST NOT define parallel or ad-hoc versions of these types.

#### Scenario: Task status transitions are persisted

- **WHEN** `MemoryRepository.saveStatus(TaskStatus.PENDING_APPROVAL)` is called for a scan id
- **THEN** a subsequent read MUST return `TaskStatus.PENDING_APPROVAL`
- **AND** the stored value MUST be the enum constant, never the raw string `"pending_approval"`

#### Scenario: Protocol shape is stable across reads

- **WHEN** a `Protocol` with `{ id, capturedAt, data: { distanceToPropertyLine, slopeDegree, waterTableDepth } }` is saved and reloaded
- **THEN** all four top-level fields MUST be preserved with identical types and values
- **AND** optional fields (`orientationDegrees`, `elevationMeters`, `soilSampleIds`) MUST round-trip when present and MUST be absent (not `null`) when omitted

### Requirement: Schema migrations are deterministic and numbered

The system SHALL manage SQLite schema changes through numbered, append-only migration files applied in order on app startup. Migrations MUST be idempotent: re-running an applied migration MUST be a no-op.

#### Scenario: Fresh install runs every migration in order

- **WHEN** the app starts against an empty SQLite database
- **THEN** migrations `001`, `002`, ... MUST be applied in ascending numeric order
- **AND** after completion the `schema_migrations` table MUST list every applied migration id

#### Scenario: Partial migration state is recovered

- **WHEN** migration `003` failed on a previous run (`schema_migrations` contains `001`, `002` only)
- **THEN** the next startup MUST re-attempt `003` without re-running `001` or `002`

### Requirement: Testability in pure Node

The system SHALL allow `MemoryRepository` tests to execute in pure Node (no React Native or Expo native modules). An in-memory SQLite adapter MUST be available through the repository factory for unit tests.

#### Scenario: In-memory repository factory supports the full interface

- **WHEN** `createMemoryRepository({ mode: "in-memory" })` is called in a Jest test
- **THEN** the returned object MUST satisfy the full `MemoryRepository` interface
- **AND** every operation MUST complete without loading any `expo-*` module

### Requirement: Sector, harvest, and soil-sample persistence

The system SHALL persist `Sector`, `Harvest`, and `SoilSample` records through `MemoryRepository`, retrievable by `plotId`, by `sectorId`, or by time range. These records are the data layer that `yield-tracking`, `rotation-advisor`, and `nutrient-advisor` read from.

#### Scenario: Create a sector and attach harvests

- **WHEN** a sector is saved via `saveSector` and a harvest is appended via `appendHarvest({ sectorId, speciesId, weightGrams, harvestedAt })`
- **THEN** `listHarvestsBySector(sectorId)` MUST return the harvest ordered by `harvestedAt` ascending
- **AND** the sector record MUST remain retrievable via `getSector(sectorId)`

#### Scenario: Soil samples linked to sector or pin

- **WHEN** a soil sample is saved with `{ sectorId }` or `{ pinId }`
- **THEN** it MUST be retrievable by whichever linkage was provided
- **AND** it MUST carry at minimum `pH`, `texture`, and `capturedAt` when persisted

### Requirement: Sector rename and delete on `MemoryRepository`

The `MemoryRepository` interface in `@garden/memory` SHALL expose `renameSector(id: string, name: string): Promise<void>` and `deleteSector(id: string): Promise<void>`. Both adapters MUST implement them:

- **Node adapter (better-sqlite3)**: `renameSector` MUST run `UPDATE sectors SET name = ? WHERE id = ?`. `deleteSector` MUST run `DELETE FROM sectors WHERE id = ?` and return successfully even if no rows matched.
- **Mobile in-memory adapter**: `renameSector` MUST replace the `Map` entry for `id` with `{ ...existing, name }` and silently no-op when the id is absent. `deleteSector` MUST delete the entry and silently no-op when absent.

Cascading behaviour is out of scope for now — harvest and event rows keyed to a deleted sector id remain in the store, and the UI MUST filter them out when presenting sector-scoped history.

#### Scenario: Rename a sector in place

- **GIVEN** a repository with a sector `s-1` named `North bed`
- **WHEN** `repository.renameSector('s-1', 'Greenhouse')` is awaited
- **THEN** `repository.getSector('s-1').name` MUST be `'Greenhouse'`
- **AND** the `id` MUST remain stable so harvest rows stay attached

#### Scenario: Delete an existing sector

- **GIVEN** a repository with a sector `s-1`
- **WHEN** `repository.deleteSector('s-1')` is awaited
- **THEN** `repository.getSector('s-1')` MUST resolve to `undefined`
- **AND** `repository.listSectorsByPlot(...)` MUST NOT include `s-1`

#### Scenario: Delete a missing sector is a no-op

- **GIVEN** a repository with no sector `s-missing`
- **WHEN** `repository.deleteSector('s-missing')` is awaited
- **THEN** the call MUST resolve without throwing

### Requirement: `listInventoryRecords` on `MemoryRepository`

The `MemoryRepository` interface SHALL expose `listInventoryRecords(): Promise<ReadonlyArray<InventoryRecord>>` returning every stored record ordered by `acquiredAt` descending.

- **Node adapter**: `SELECT * FROM inventory_records ORDER BY acquired_at DESC`.
- **Mobile in-memory adapter**: `Array.from(map.values()).sort((a, b) => a.acquiredAt < b.acquiredAt ? 1 : -1)`.

#### Scenario: Most-recent record first

- **GIVEN** three inventory records saved in order at `t=1`, `t=3`, `t=2`
- **WHEN** `listInventoryRecords()` is awaited
- **THEN** the result MUST be ordered `[t=3, t=2, t=1]`
