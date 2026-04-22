# nutrient-advisor Specification

## Purpose
TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.
## Requirements
### Requirement: Per-species nutrient targets encoded as typed data

The system SHALL encode per-species nutrient demand (N, P, K, Ca, Mg, S, and key micros) and target soil pH range in `packages/engine/src/nutrient/species-demand.ts`. Each entry MUST carry `{ speciesId, targetNpk: { n, p, k }, targetPhRange: [min, max], microTargets?, sourceCitation }`.

#### Scenario: Lookup demand for a species
- **WHEN** `lookupDemand("tomato-san-marzano")` is called
- **THEN** the returned record MUST include `targetNpk`, `targetPhRange`, and a non-empty `sourceCitation`

#### Scenario: Missing species is a surfaced gap, not a crash
- **WHEN** `lookupDemand(speciesId)` is called with an unknown id
- **THEN** the function MUST return `summary.actionRequired(...)` prompting the user to record demand data
- **AND** MUST NOT throw

### Requirement: Liebig's Law of the Minimum drives amendment ranking

The system SHALL implement `computeLimitingFactor(sample, demand)` that returns the single most-limiting nutrient: the one furthest below its target, normalised against its target range. `adviseAmendments(sample, species)` MUST lead with the limiting factor; subsequent amendments MUST be ordered by decreasing shortfall.

#### Scenario: Nitrogen is the limiting factor
- **WHEN** a soil sample is low-N, adequate-P, adequate-K for a heavy N-feeder species
- **THEN** `computeLimitingFactor` MUST return nutrient code `N`
- **AND** the first amendment in `adviseAmendments` MUST target N with quantities in an agronomically sensible unit (kg/ha or g/m²)

#### Scenario: pH outside range is surfaced before NPK
- **WHEN** soil pH is outside the species' target range
- **THEN** the first recommendation MUST be a pH correction (lime or sulphur depending on direction)
- **AND** the rationale MUST cite the pH-nutrient-availability relationship with its `sourceCitation`

### Requirement: Irrigation target from FAO-56 Penman-Monteith ET₀ and Kc

The system SHALL implement FAO-56 reference evapotranspiration (`computeEt0({ lat, elevationM, dayOfYear, tempMeanC, rhMeanPct, windMs, solarMjm2d })`) and a per-species `Kc` coefficient table (`packages/engine/src/nutrient/kc-tables.ts`). `adviseWater({ speciesId, growthStage, climate })` MUST return the recommended irrigation in mm/week plus a rationale that cites FAO-56.

#### Scenario: ET₀ call returns a finite positive mm/day
- **WHEN** `computeEt0` is called with the Sofia-basin mid-summer climatology defaults
- **THEN** the result MUST be a finite positive number in mm/day

#### Scenario: Irrigation target for tomato mid-season
- **WHEN** `adviseWater({ speciesId: "tomato-san-marzano", growthStage: "mid-season", climate: <sofia-jul> })` is called
- **THEN** the result MUST be `ET₀ * Kc_mid * 7` in mm/week
- **AND** the rationale MUST cite FAO-56 and include the specific `Kc` value used

### Requirement: Offline climatology fallback with a flagged warning

When live weather is unavailable, the system SHALL fall back to a bundled Sofia-basin monthly climatology table (temperature mean, RH, wind, solar). The returned `advisory` MUST include a `summary.warning` noting the fallback source so the user knows the precision is lower.

#### Scenario: No live weather → climatology used
- **WHEN** `adviseWater` is called with `climate.source = "climatology-fallback"`
- **THEN** the returned response MUST include a `summary.warning("Using Sofia-basin monthly averages; connect a weather station for precision.")`
- **AND** the citation MUST name the climatology dataset used

### Requirement: Nutrient/irrigation advisor is a pure, deterministic function

The system SHALL implement `adviseAmendments` and `adviseWater` as const arrow functions in `@garden/engine` that do not call the `ReasoningProvider`. Reasoning-LLM narration (if any) MUST wrap these deterministic outputs, not replace them.

#### Scenario: Same inputs produce same outputs
- **WHEN** `adviseAmendments` is called twice with the same sample and species
- **THEN** both calls MUST return byte-identical recommendation arrays
- **AND** neither call MUST touch the network or the reasoning provider

### Requirement: Every amendment carries its unit and source citation

The system SHALL reject amendment recommendations that omit either the numeric quantity with unit (e.g., `{ amount: 40, unit: "g/m²" }`) or the `sourceCitation`. CI MUST fail on any `species-demand.ts` entry missing these fields.

#### Scenario: Amendment surface in the UI
- **WHEN** the UI renders an amendment
- **THEN** the quantity with unit MUST be visible alongside the nutrient name
- **AND** the source citation MUST be reachable via one tap

