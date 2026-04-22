# compliance-engine Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.

## Requirements

### Requirement: Pure-function compliance evaluation

The system SHALL expose `evaluateTopographyCompliance(plotScan, memoryRepository)` as an async const arrow function that takes a `Protocol` and a `MemoryRepository`, and returns a `summary` (`success` / `warning` / `actionRequired` / `rejection`). The function MUST use early-return guard clauses with max 2 nesting levels and MUST NOT use `else if` or `switch`.

#### Scenario: Missing protocol data throws factory error

- **WHEN** `evaluateTopographyCompliance` is called with `{ data: null }` or with no `plotScan`
- **THEN** the function MUST throw `SmepErrors.protocolEmpty()` from `@garden/config`
- **AND** MUST NOT throw a bare `new Error(...)`

#### Scenario: Happy-path flat, compliant plot

- **WHEN** the scan has `distanceToPropertyLine=5, slopeDegree=5, waterTableDepth=10`
- **THEN** `memoryRepository.saveStatus` MUST be called with `TaskStatus.VERIFIED`
- **AND** the return value MUST be `summary.success("Grading plan is compliant and ecologically sound.")`

### Requirement: Sofia setback, slope, and water-table rules

The system SHALL evaluate at minimum these three Sofia-basin rules, checked in order — setback first (highest-severity rejection), then structural slope, then drainage — with early returns between rules.

#### Scenario: Boundary breach rejects the plan

- **WHEN** `distanceToPropertyLine < SpatialLimits.MIN_SETBACK_METERS`
- **THEN** `memoryRepository.saveStatus` MUST be called with `TaskStatus.FAILED`
- **AND** the return MUST be `summary.rejection("Retaining wall breaches municipal setback limits.")`

#### Scenario: Steep slope requires a micro-permit

- **WHEN** setback is compliant AND `slopeDegree > SpatialLimits.MAX_UNPERMITTED_SLOPE`
- **THEN** `memoryRepository.saveStatus` MUST be called with `TaskStatus.PENDING_APPROVAL`
- **AND** the return MUST be `summary.warning("Slope exceeds 15 degrees. Micro-permit engineering specs generated.")`
- **AND** a micro-permit spec document MUST be persisted via `memoryRepository.savePermitSpec`

#### Scenario: High water table flags biological intervention

- **WHEN** setback and slope are compliant AND `waterTableDepth < SpatialLimits.SAFE_WATER_TABLE_DEPTH`
- **THEN** `memoryRepository.saveStatus` MUST be called with `TaskStatus.REQUIRES_INTERVENTION`
- **AND** the return MUST be `summary.actionRequired("High water table detected. Recommend deep-rooting shrubs before grading.")`

### Requirement: Every verdict is traceable to a rule source

The system SHALL attach a `sourceRuleId` to every non-success verdict so a reader can audit _which_ rule produced the outcome. Rule definitions MUST live in a typed, reviewable data file (not inline in the evaluator) and MUST include a human-readable reference field.

#### Scenario: Rejection verdict carries the rule id

- **WHEN** a plan is rejected for boundary breach
- **THEN** the returned summary's `meta.sourceRuleId` MUST equal `"sofia.setback.boundary"`
- **AND** a `meta.reference` field MUST be populated with the municipal article or source citation

#### Scenario: Rules catalogue is a pure data file

- **WHEN** a developer adds a new rule
- **THEN** the addition MUST be an entry appended to `packages/engine/src/rules/sofia.ts`
- **AND** the evaluator module MUST NOT require a code change to pick up the new rule

### Requirement: Advisory framing on every surfaced verdict

The system SHALL present every non-success verdict with an explicit advisory disclaimer ("verify with municipality — not legal advice") in the voice and screen surfaces. The engine MUST include this disclaimer text in the `summary.meta.disclaimer` field.

#### Scenario: Advisory disclaimer present on rejection

- **WHEN** a rejection verdict is produced
- **THEN** `summary.meta.disclaimer` MUST be non-empty and MUST reference verifying with the municipality
