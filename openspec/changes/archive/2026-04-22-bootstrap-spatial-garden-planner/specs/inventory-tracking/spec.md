## ADDED Requirements

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
