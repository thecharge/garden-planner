import { actionRequired } from "@garden/core";
import type { Protocol, SoilSample, SpeciesRecord, Summary } from "@garden/config";

export type SpeciesMatch = {
  readonly speciesId: string;
  readonly score: number;
  readonly reason: string;
};

const scoreSiteFit = (
  species: SpeciesRecord,
  scan: Protocol,
  soil?: SoilSample
): number => {
  let score = 0;
  const siteSoil = soil?.texture ?? scan.data.soilType;
  if (siteSoil && species.siteFit.soilTypes.includes(siteSoil)) {
    score += 3;
  }
  if (scan.data.slopeDegree <= species.siteFit.slopeMaxDegrees) {
    score += 2;
  }
  if (scan.data.waterTableDepth >= species.siteFit.waterTableMinDepthMeters) {
    score += 2;
  }
  if (soil && soil.pH >= species.phMin && soil.pH <= species.phMax) {
    score += 2;
  }
  return score;
};

const reasonFor = (species: SpeciesRecord, scan: Protocol, soil?: SoilSample): string => {
  const parts: string[] = [];
  const siteSoil = soil?.texture ?? scan.data.soilType;
  if (siteSoil && species.siteFit.soilTypes.includes(siteSoil)) {
    parts.push(`soil matches (${siteSoil})`);
  }
  if (scan.data.slopeDegree <= species.siteFit.slopeMaxDegrees) {
    parts.push(`slope ${scan.data.slopeDegree}° ≤ max ${species.siteFit.slopeMaxDegrees}°`);
  }
  if (scan.data.waterTableDepth >= species.siteFit.waterTableMinDepthMeters) {
    parts.push(`water table ${scan.data.waterTableDepth}m adequate`);
  }
  if (soil && soil.pH >= species.phMin && soil.pH <= species.phMax) {
    parts.push(`pH ${soil.pH} within ${species.phMin}–${species.phMax}`);
  }
  return parts.length === 0 ? "no strong match" : parts.join(", ");
};

export type MatchResult =
  | { readonly kind: "matches"; readonly ranking: ReadonlyArray<SpeciesMatch> }
  | { readonly kind: "no-match"; readonly summary: Summary };

/** Match a scanned site to the species catalogue. Returns a ranked list (descending)
 * or an actionRequired summary when no species scores above 0.
 */
export const matchSpeciesToSite = (
  scan: Protocol,
  catalogue: ReadonlyArray<SpeciesRecord>,
  soil?: SoilSample
): MatchResult => {
  const scored: SpeciesMatch[] = [];
  for (const species of catalogue) {
    const score = scoreSiteFit(species, scan, soil);
    if (score <= 0) {
      continue;
    }
    scored.push({
      speciesId: species.id,
      score,
      reason: reasonFor(species, scan, soil)
    });
  }
  if (scored.length === 0) {
    return {
      kind: "no-match",
      summary: actionRequired(
        "No local species match — record a soil sample for follow-up."
      )
    };
  }
  scored.sort((a, b) => b.score - a.score);
  return { kind: "matches", ranking: scored };
};
