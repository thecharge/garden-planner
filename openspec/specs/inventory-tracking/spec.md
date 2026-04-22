# inventory-tracking Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.

## Requirements

### Requirement: Seeds, plants, and tools inventory with time tracking

The system SHALL maintain an on-device inventory of seeds, plants, and tools. Each record MUST carry `{ id, kind, name, quantity, unit, acquiredAt, sourceSupplierId?, notes? }` and MUST be persisted through `MemoryRepository`. Every quantity change MUST produce an audit event.

#### Scenario: Record acquisition of a seed packet

- **WHEN** the user records 100 tomato seeds acquired from supplier `maria-chepinci`
- **THEN** an inventory record with `kind=SEED, quantity=100, sourceSupplierId="maria-chepinci"` MUST be persisted
- **AND** a corresponding `InventoryEvent` with `kind=EventKind.ACQUIRED, delta=+100` MUST be persisted

#### Scenario: Sow reduces seed quantity and logs event

- **WHEN** the user records sowing 20 of the 100 tomato seeds
- **THEN** the seed record's `quantity` MUST be 80
- **AND** an `InventoryEvent` with `kind=EventKind.SOWED, delta=-20` MUST be persisted with a `plantingPinId`

### Requirement: Pest and soil events linked to spatial pins

The system SHALL support logging pest-control and soil-sample events against a specific spatial pin on the active plot. Events MUST be retrievable both by pin and by time range.

#### Scenario: Log aphid observation on tomato bed

- **WHEN** the user logs `EventKind.PEST_OBSERVED` with `{ pestSpeciesId: "aphid", pinId: "bed-3" }`
- **THEN** the event MUST be retrievable via `memoryRepository.listEventsByPin("bed-3")`
- **AND** MUST include its `capturedAt` timestamp

#### Scenario: Soil sample recorded at pin

- **WHEN** a soil-sample event with `{ pinId: "north-slope", pH: 6.4, texture: "clay" }` is logged
- **THEN** the `soil-intelligence` capability MUST be able to consult that sample when diagnosing the same pin

### Requirement: Immutable audit trail

`InventoryEvent` records MUST be append-only from the repository surface. Quantity corrections MUST be expressed as new `EventKind.CORRECTION` events, never by mutating prior events.

#### Scenario: Correcting a mis-entered quantity

- **WHEN** the user corrects a prior sow event from 20 to 15
- **THEN** the original `SOWED` event MUST remain unchanged
- **AND** a new `CORRECTION` event with `delta=+5` MUST be appended

### Requirement: Event factories live in the config package

The system SHALL define `EventKind` in `@garden/config` as an enum and MUST provide factory helpers (e.g., `createSowEvent`, `createPestEvent`) in `@garden/core`. Direct object-literal construction of events outside these factories MUST fail a lint rule.

#### Scenario: Sow event built via factory

- **WHEN** a feature wants to log a sow event
- **THEN** it MUST call `createSowEvent({...})` from `@garden/core`
- **AND** MUST NOT import `EventKind` from anywhere other than `@garden/config`

### Requirement: Inventory record entry form

The Inventory tab SHALL expose a form for logging a new inventory record. The form MUST use `@garden/ui` primitives and MUST collect:

1. **Kind** — a single-choice row of `Button` pills backed by `InventoryKind` (`Seed`, `Plant`, `Tool`, `Amendment`). No string-literal unions — the source of truth is the `InventoryKind` const in `@garden/config`.
2. **Name** — `TextInput` (plain text, required, ≤80 chars).
3. **Quantity** — `TextInput` with `keyboardType: 'numeric'` (required, >0).
4. **Unit** — `TextInput` (plain text, e.g., `g`, `kg`, `pcs`, required, ≤20 chars).
5. **Supplier (optional)** — `TextInput` (plain text, ≤80 chars).
6. **Submit** — a `Button` that, on press, calls `MemoryRepository.saveInventoryRecord(record)` and resets the form on success. While the mutation is in-flight the button MUST show the `loading` state and be disabled.

Submission MUST be blocked in-UI when `name`, `quantity`, or `unit` are empty, with a `Caption` variant `actionRequired` describing the missing field.

#### Scenario: User logs a seed purchase

- **GIVEN** the Inventory tab is open
- **WHEN** the user selects kind `Seed`, types name `Detvan tomato`, quantity `25`, unit `g`, supplier `Maria — Chepinci co-op`, and taps Submit
- **THEN** `saveInventoryRecord` MUST be called with `{ kind: InventoryKind.Seed, name: 'Detvan tomato', quantity: 25, unit: 'g', supplierName: 'Maria — Chepinci co-op', recordedAt: <iso-now> }`
- **AND** the form MUST reset to empty after the mutation resolves

#### Scenario: Missing required field is rejected

- **WHEN** the user taps Submit with name empty
- **THEN** `saveInventoryRecord` MUST NOT be called
- **AND** a `Caption` variant `actionRequired` MUST read "Name is required"

### Requirement: Inventory event entry form

The Inventory tab SHALL also expose a form for logging an inventory event against an existing sector. The form MUST collect:

1. **Kind** — a single-choice row of `Button` pills backed by an `InventoryEventKind` const exposed from `@garden/config` with values `Sowed`, `Transplanted`, `PestObserved`, `SoilSample`, `PlantFailure`, `Correction`. No string-literal unions.
2. **Sector** — a single-choice row of `Button` pills, one per sector returned by `MemoryRepository.listSectors()`. Empty sector list MUST show a `Caption` variant `actionRequired` linking to the Sectors tab.
3. **Species (optional)** — a single-choice row of `Button` pills seeded from the curated species list in `@garden/engine`.
4. **Note (optional)** — `TextInput` (plain text, ≤240 chars).
5. **Submit** — a `Button` that calls `MemoryRepository.saveInventoryEvent(event)` and resets the form on success.

Submission MUST be blocked in-UI when `kind` or `sectorId` is unset.

#### Scenario: User logs a sowing event

- **GIVEN** a sector `s-1` exists
- **WHEN** the user selects kind `Sowed`, sector `s-1`, species `tomato-detvan`, adds note `direct seed, after frost`, and taps Submit
- **THEN** `saveInventoryEvent` MUST be called with `{ kind: InventoryEventKind.Sowed, sectorId: 's-1', speciesId: 'tomato-detvan', note: 'direct seed, after frost', occurredAt: <iso-now> }`

#### Scenario: No sectors → link to Sectors tab

- **GIVEN** `listSectors()` returns an empty array
- **WHEN** the user opens the Log-event form
- **THEN** the sector picker MUST be replaced by a `Caption` variant `actionRequired` reading "Add a sector first"
- **AND** a `Button` MUST navigate to the Sectors tab on press
