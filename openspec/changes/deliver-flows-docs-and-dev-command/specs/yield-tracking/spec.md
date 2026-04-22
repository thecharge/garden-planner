## ADDED Requirements

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
