## ADDED Requirements

### Requirement: Crop-family rotation rules encoded as typed data

The system SHALL encode crop-rotation rules as a typed data file (`packages/engine/src/rotation/rotation-rules.ts`) whose entries reference `CropFamily` enum members from `@garden/config`. Rules MUST cover at minimum: "avoid same family within N years", "legume precedes heavy feeder", and family-to-family affinity (positive or negative).

#### Scenario: Same-family-too-soon triggers a negative recommendation
- **WHEN** `adviseRotation` is called for a sector where `SOLANACEAE` (tomato family) was grown the previous year
- **THEN** proposing another `SOLANACEAE` member for the current year MUST receive a negative score
- **AND** the reason MUST cite the rotation-interval rule and its `sourceCitation`

#### Scenario: Legume precedes heavy feeder gives a positive boost
- **WHEN** the sector's previous crop was `FABACEAE` (legumes) and a candidate is `BRASSICACEAE` (cabbage family)
- **THEN** the score MUST be positively boosted
- **AND** the reason MUST cite nitrogen-fixation carryover with its `sourceCitation`

### Requirement: Companion-planting affinities encoded as typed data

The system SHALL encode companion-planting pair affinities in `packages/engine/src/rotation/companions.ts`. Each entry MUST carry `{ speciesA, speciesB, affinity: "POSITIVE" | "NEGATIVE" | "NEUTRAL", mechanism, sourceCitation }`.

#### Scenario: Basil-near-tomato is a positive companion
- **WHEN** `adviseRotation` evaluates a candidate for a sector adjacent to a sector growing tomato
- **THEN** basil MUST receive a positive adjacency boost with `mechanism` citing pest-deterrent / flavour effects
- **AND** the reason MUST include `sourceCitation`

#### Scenario: Negative companion is surfaced as a warning, not a silent down-rank
- **WHEN** `adviseRotation` would recommend a species with a known negative adjacency to a neighbouring sector's current crop
- **THEN** the recommendation MUST be demoted *and* MUST surface a `summary.warning` entry in the response explaining the negative pairing

### Requirement: `adviseRotation` is a pure function over sector history and catalogue

The system SHALL implement `adviseRotation({ sector, sectorHistory, neighbourCurrentCrops, availableSpecies, year })` as a const arrow function in `@garden/engine` that returns `{ recommendations: RotationRecommendation[], warnings: Summary[] }`. Each `RotationRecommendation` MUST carry `{ speciesId, score, reasons: RotationReason[] }`, and each reason MUST carry its `sourceCitation`.

#### Scenario: Deterministic output for same inputs
- **WHEN** `adviseRotation` is called twice with identical inputs
- **THEN** both calls MUST return identical recommendation and warning arrays
- **AND** the function MUST NOT depend on the reasoning provider

#### Scenario: Missing sector history
- **WHEN** `sectorHistory` is empty (new sector)
- **THEN** the function MUST return recommendations based on `neighbourCurrentCrops` and general-fit data only
- **AND** MUST include a `summary.actionRequired` note that history will improve quality next cycle

### Requirement: Every recommendation cites a reviewable source

The system SHALL reject recommendations with no `sourceCitation`. CI MUST fail the build if any entry in `rotation-rules.ts` or `companions.ts` lacks a non-empty `sourceCitation`. The citation MUST name a source (book, extension-service bulletin, peer-reviewed paper, agronomist) reviewable by a third party.

#### Scenario: New rule without citation fails CI
- **WHEN** a developer appends a rotation rule without `sourceCitation`
- **THEN** the lint/CI step MUST fail the build
- **AND** MUST name the offending entry in the error

### Requirement: Rotation UI is accessible by default

The rotation-advisor view MUST surface each recommendation with its score, top reasons (at least one), and the source citation for each reason, formatted per the accessibility spec (AA contrast, Lexend type, TalkBack labels, captions for any audio, non-colour redundancy for score tiers).

#### Scenario: Recommendation row is screen-reader readable
- **WHEN** TalkBack focuses a recommendation row
- **THEN** the announcement MUST include species name, score tier ("strong recommendation" / "consider" / "avoid"), and the first reason
- **AND** the source citation MUST be reachable via a single "details" tap
