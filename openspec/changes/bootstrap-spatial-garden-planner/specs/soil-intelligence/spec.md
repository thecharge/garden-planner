## ADDED Requirements

### Requirement: Local species ↔ site matching

The system SHALL match a `Protocol` scan to a ranked list of species appropriate for its soil type, slope, water-table depth, and orientation, drawing from a locally bundled Chepinci/Sofia-basin catalogue. Matching MUST run offline.

#### Scenario: Clay-heavy, partially shaded, damp site
- **WHEN** a scan reports `soilType="clay", orientationDegrees=0 (north), waterTableDepth=1.5`
- **THEN** the top-ranked species MUST include at least one deep-rooting, moisture-tolerant, clay-friendly species from the catalogue
- **AND** each recommendation MUST include `{ speciesId, score, reason }`

#### Scenario: No matches available
- **WHEN** the site profile matches no species in the catalogue
- **THEN** the function MUST return `summary.actionRequired("No local species match — record a soil sample for follow-up.")`
- **AND** MUST NOT throw

### Requirement: "Why does everything die here?" diagnosis

The system SHALL accept a spatial pin (a point on the plot) and return a diagnosis that combines water-table hints, soil compaction estimates, and historical events logged at that pin, plus an immediate local fix recommendation.

#### Scenario: Pooling water with compaction
- **WHEN** the pinned point has `waterTableDepth < 1.0` AND recent inventory events tagged `plantFailure`
- **THEN** the diagnosis MUST cite both factors in `summary.meta.factors`
- **AND** the recommended fix MUST propose deep-rooting water-hungry shrubs by `speciesId`

#### Scenario: No history, no diagnosis overreach
- **WHEN** the pin has no logged events and site data is ambiguous
- **THEN** the function MUST return `summary.actionRequired(...)` prompting the user to record a soil sample
- **AND** MUST NOT fabricate a diagnosis

### Requirement: Local-supplier linkage on recommendations

The system SHALL, when a recommendation includes a species also stocked by a locally recorded supplier, include the supplier reference (e.g., "buy from Maria — pinned on map") in `summary.meta.supplier`. Supplier records live in the local inventory via `inventory-tracking`.

#### Scenario: Supplier known
- **WHEN** the recommended `speciesId` matches a supplier record in local memory
- **THEN** `summary.meta.supplier` MUST be populated with `{ name, pinId, contact? }`

#### Scenario: Supplier unknown
- **WHEN** no supplier record matches the `speciesId`
- **THEN** `summary.meta.supplier` MUST be absent (not `null`)

### Requirement: Species catalogue is a typed, reviewable data file

The system SHALL store the species catalogue as a typed data file (`packages/engine/src/data/species.ts`) annotated with site-fit metadata and a `sourceCitation` field per entry. Adding a species MUST NOT require evaluator code changes.

#### Scenario: Adding a new species
- **WHEN** a new entry is appended to `packages/engine/src/data/species.ts` with `{ id, name, soilFit, slopeFit, waterTableFit, orientationFit, notes, sourceCitation }`
- **THEN** the matcher MUST pick it up on next run without any other code change
- **AND** CI MUST fail the build if `sourceCitation` is missing on any entry
