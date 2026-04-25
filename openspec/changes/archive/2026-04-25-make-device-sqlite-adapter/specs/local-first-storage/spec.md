## MODIFIED Requirements

### Requirement: Offline-first persistence

The system SHALL persist every user artifact (plot scans, inventory, events, settings) to on-device SQLite so that every core workflow functions with no network connectivity. No capability MAY require a network round-trip to read or write local state.

The mobile app SHALL use `createMemoryRepository({ mode: 'device', sqlite: createExpoSqliteAdapter(db) })` — not an in-memory `Map` shim — as its `MemoryRepository` implementation from first launch onward.

#### Scenario: Save and retrieve a plot scan offline

- **WHEN** the device is in airplane mode and a `Protocol` scan is saved via `MemoryRepository.saveProtocol`
- **THEN** the record MUST be durably written to SQLite
- **AND** a subsequent `MemoryRepository.getProtocol(id)` MUST return the identical record with `capturedAt` preserved

#### Scenario: Repository unavailable error is thrown from the factory

- **WHEN** the SQLite file cannot be opened (missing permissions or corrupted DB)
- **THEN** `MemoryRepository` operations MUST throw `SmepErrors.repositoryUnavailable()` from `@garden/config`
- **AND** MUST NOT throw a bare `new Error(...)`

#### Scenario: Sectors survive app restart

- **WHEN** a sector is saved via `saveSector` and the app process is restarted
- **THEN** `getSector(id)` MUST return the same sector after restart
- **AND** the in-memory Map shim MUST NOT be the backing store
