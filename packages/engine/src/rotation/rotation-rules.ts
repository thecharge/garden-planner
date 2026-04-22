import { CropFamily, RotationReasonCode } from "@garden/config";
import type { RotationRule } from "@garden/config";

const COLEMAN = "Coleman, 'The New Organic Grower' (3rd ed.), chapter on crop rotation.";
const USDA_SARE = "USDA SARE, 'Crop Rotation on Organic Farms: A Planning Manual'.";

const SAME_FAMILY_LOOKBACK_YEARS = 3;

const sameFamilyIntervalRule: RotationRule = {
  id: "rotation.same-family-interval",
  description: "Avoid planting the same crop family in a sector within three years.",
  sourceCitation: COLEMAN,
  apply: (context) => {
    const recentYears = context.currentYear - SAME_FAMILY_LOOKBACK_YEARS;
    const recentSameFamily = context.sectorHistory.find(
      (h) => h.family === context.candidateFamily && h.year > recentYears
    );
    if (!recentSameFamily) {
      return { scoreDelta: 0, reason: null };
    }
    return {
      scoreDelta: -4,
      reason: {
        code: RotationReasonCode.SameFamilyTooSoon,
        message: `Same family grown here in ${recentSameFamily.year}; wait at least until ${recentSameFamily.year + SAME_FAMILY_LOOKBACK_YEARS}.`,
        sourceCitation: COLEMAN
      }
    };
  }
};

const legumeBeforeHeavyFeederRule: RotationRule = {
  id: "rotation.legume-nitrogen-carryover",
  description: "Heavy feeders (brassicas, solanaceae) benefit from a legume the previous year.",
  sourceCitation: USDA_SARE,
  apply: (context) => {
    if (
      context.candidateFamily !== CropFamily.Brassicaceae &&
      context.candidateFamily !== CropFamily.Solanaceae
    ) {
      return { scoreDelta: 0, reason: null };
    }
    const prior = context.sectorHistory.find((h) => h.year === context.currentYear - 1);
    if (!prior || prior.family !== CropFamily.Fabaceae) {
      return { scoreDelta: 0, reason: null };
    }
    return {
      scoreDelta: 3,
      reason: {
        code: RotationReasonCode.LegumeNitrogenCarryover,
        message: "Previous legume crop leaves nitrogen for this heavy feeder.",
        sourceCitation: USDA_SARE
      }
    };
  }
};

const alliumAfterBrassicaRule: RotationRule = {
  id: "rotation.allium-after-brassica",
  description: "Alliums tolerate following brassicas well.",
  sourceCitation: USDA_SARE,
  apply: (context) => {
    if (context.candidateFamily !== CropFamily.Alliaceae) {
      return { scoreDelta: 0, reason: null };
    }
    const prior = context.sectorHistory.find((h) => h.year === context.currentYear - 1);
    if (!prior || prior.family !== CropFamily.Brassicaceae) {
      return { scoreDelta: 0, reason: null };
    }
    return {
      scoreDelta: 1,
      reason: {
        code: RotationReasonCode.AlliumAfterBrassica,
        message: "Alliums follow brassicas without trouble.",
        sourceCitation: USDA_SARE
      }
    };
  }
};

export const rotationRules: ReadonlyArray<RotationRule> = [
  sameFamilyIntervalRule,
  legumeBeforeHeavyFeederRule,
  alliumAfterBrassicaRule
];
