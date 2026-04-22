import { warning } from "@garden/core";
import { CompanionAffinity, RotationReasonCode } from "@garden/config";
import type {
  CropFamily,
  RotationRecommendation,
  RotationReason,
  SpeciesRecord,
  Summary
} from "@garden/config";
import { familyOfSpecies } from "./families";
import { companionTable } from "./companions";
import { rotationRules } from "./rotation-rules";

export type AdviseRotationInput = {
  readonly sectorHistory: ReadonlyArray<{ family: CropFamily; year: number }>;
  readonly neighbourCurrentCrops: ReadonlyArray<string>;
  readonly availableSpecies: ReadonlyArray<SpeciesRecord>;
  readonly currentYear: number;
};

export type AdviseRotationResult = {
  readonly recommendations: ReadonlyArray<RotationRecommendation>;
  readonly warnings: ReadonlyArray<Summary>;
};

const BASELINE_SCORE = 5;
const POSITIVE_COMPANION_BONUS = 1;
const NEGATIVE_COMPANION_PENALTY = 2;

type CompanionPair = { entry: (typeof companionTable)[number]; otherId: string };

const pairIfRelevant = (
  entry: (typeof companionTable)[number],
  speciesId: string,
  neighbour: string
): CompanionPair | null => {
  const aMatch = entry.speciesA === speciesId && entry.speciesB === neighbour;
  const bMatch = entry.speciesB === speciesId && entry.speciesA === neighbour;
  if (!aMatch && !bMatch) {
    return null;
  }
  return { entry, otherId: aMatch ? entry.speciesB : entry.speciesA };
};

const companionsForNeighbour = (
  speciesId: string,
  neighbour: string
): ReadonlyArray<CompanionPair> => {
  const out: CompanionPair[] = [];
  for (const entry of companionTable) {
    const pair = pairIfRelevant(entry, speciesId, neighbour);
    if (pair) {
      out.push(pair);
    }
  }
  return out;
};

const companionsFor = (
  speciesId: string,
  neighbours: ReadonlyArray<string>
): ReadonlyArray<CompanionPair> => {
  const out: CompanionPair[] = [];
  for (const n of neighbours) {
    out.push(...companionsForNeighbour(speciesId, n));
  }
  return out;
};

const scoreOneCandidate = (
  candidate: SpeciesRecord,
  input: AdviseRotationInput
): { score: number; reasons: RotationReason[]; negativeCompanions: string[] } => {
  const reasons: RotationReason[] = [];
  const negativeCompanions: string[] = [];
  let score = BASELINE_SCORE;

  for (const rule of rotationRules) {
    const applied = rule.apply({
      sectorHistory: input.sectorHistory,
      candidateFamily: candidate.family,
      neighbourFamilies: input.neighbourCurrentCrops
        .map((id) => familyOfSpecies(id, input.availableSpecies))
        .filter((f): f is CropFamily => f !== undefined),
      currentYear: input.currentYear
    });
    score += applied.scoreDelta;
    if (applied.reason) {
      reasons.push(applied.reason);
    }
  }

  const companions = companionsFor(candidate.id, input.neighbourCurrentCrops);
  for (const { entry, otherId } of companions) {
    if (entry.affinity === CompanionAffinity.Positive) {
      score += POSITIVE_COMPANION_BONUS;
      reasons.push({
        code: RotationReasonCode.CompanionPositive,
        message: `Positive pairing with ${otherId}: ${entry.mechanism}`,
        sourceCitation: entry.sourceCitation
      });
    }
    if (entry.affinity === CompanionAffinity.Negative) {
      score -= NEGATIVE_COMPANION_PENALTY;
      negativeCompanions.push(otherId);
      reasons.push({
        code: RotationReasonCode.CompanionNegative,
        message: `Negative pairing with ${otherId}: ${entry.mechanism}`,
        sourceCitation: entry.sourceCitation
      });
    }
  }

  if (reasons.length === 0) {
    reasons.push({
      code: RotationReasonCode.GeneralFit,
      message: "General fit — no rotation signal in history or neighbours.",
      sourceCitation: "Default advisor policy."
    });
  }

  return { score, reasons, negativeCompanions };
};

/** Deterministic rotation advisor. Pure function; no reasoning provider. */
export const adviseRotation = (input: AdviseRotationInput): AdviseRotationResult => {
  const recommendations: RotationRecommendation[] = [];
  const warnings: Summary[] = [];

  for (const candidate of input.availableSpecies) {
    const { score, reasons, negativeCompanions } = scoreOneCandidate(candidate, input);
    recommendations.push({ speciesId: candidate.id, score, reasons });
    for (const neg of negativeCompanions) {
      warnings.push(
        warning(`Consider separating ${candidate.id} from ${neg} — negative companion pairing.`)
      );
    }
  }

  if (input.sectorHistory.length === 0) {
    warnings.push(
      warning(
        "No planting history for this sector yet — advice will improve with each recorded season."
      )
    );
  }

  recommendations.sort((a, b) => b.score - a.score);
  return { recommendations, warnings };
};
