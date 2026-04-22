## ADDED Requirements

### Requirement: `MemoryRepository.deleteSector`

The `MemoryRepository` interface in `@garden/memory` SHALL expose a `deleteSector(id: string): Promise<void>` method. Both adapters MUST implement it:

- **Node adapter (better-sqlite3)**: MUST run `DELETE FROM sectors WHERE id = ?` and return successfully even if no rows matched.
- **Mobile in-memory adapter**: MUST delete the sector from its backing `Map` and return successfully even if the id was absent (idempotent).

Cascading behaviour is out of scope for this change — harvest and event rows keyed to the deleted sector id remain in the store, and the UI MUST filter them out when presenting sector-scoped history. A follow-up change MAY introduce cascade semantics.

#### Scenario: Delete an existing sector

- **GIVEN** a repository with a sector `s-1`
- **WHEN** `repository.deleteSector('s-1')` is awaited
- **THEN** `repository.listSectors()` MUST NOT include `s-1`

#### Scenario: Delete a missing sector is a no-op

- **GIVEN** a repository with no sector `s-missing`
- **WHEN** `repository.deleteSector('s-missing')` is awaited
- **THEN** the call MUST resolve without throwing

#### Scenario: Harvest rows survive deletion for now

- **GIVEN** a sector `s-1` with one harvest row
- **WHEN** `repository.deleteSector('s-1')` is awaited
- **THEN** `repository.listHarvests()` MAY still contain the orphaned row
- **AND** the Sectors UI MUST NOT display orphaned harvests on any remaining sector
