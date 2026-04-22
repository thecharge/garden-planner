import {
  ClimateSource,
  LimitingFactorCode,
  NutrientUnit,
  SummaryType
} from "@garden/config";
import { actionRequired, computeEt0, success, warning } from "@garden/core";
import type {
  AmendmentRecommendation,
  ClimatePoint,
  GrowthStage,
  IrrigationAdvisory,
  SoilSample,
  Summary
} from "@garden/config";
import { computeLimitingFactor } from "./liebig";
import { kcSourceCitation, lookupKc } from "./kc-tables";
import { lookupDemand } from "./species-demand";

const LIEBIG_CITATION =
  "Sprengel–Liebig Law of the Minimum; Brady & Weil, 'Nature and Properties of Soils', ch. 12.";

const PH_FIX_AMOUNT_G_PER_SQM = 100;
const SHORTFALL_TO_PERCENT = 100;

const amendmentFor = (
  limiting: ReturnType<typeof computeLimitingFactor>,
  demand: ReturnType<typeof lookupDemand>
): AmendmentRecommendation | null => {
  if (!limiting || !demand) {
    return null;
  }
  if (limiting.code === LimitingFactorCode.PH) {
    const direction = (limiting.currentValue ?? 7) < demand.targetPhRange[0] ? "lime" : "sulphur";
    return {
      nutrient: LimitingFactorCode.PH,
      amount: PH_FIX_AMOUNT_G_PER_SQM,
      unit: NutrientUnit.GramsPerSquareMeter,
      rationale: `pH ${limiting.currentValue?.toFixed(2)} outside ${demand.targetPhRange[0]}–${demand.targetPhRange[1]}. Apply ${direction} and retest in 8 weeks.`,
      sourceCitation: LIEBIG_CITATION
    };
  }
  const shortfallPct = Math.max(
    1,
    Math.round(limiting.shortfallNormalised * SHORTFALL_TO_PERCENT)
  );
  return {
    nutrient: limiting.code,
    amount: shortfallPct,
    unit: NutrientUnit.GramsPerSquareMeter,
    rationale: `Soil ${limiting.code} below target by ~${shortfallPct}%. Address this before other nutrients (Liebig).`,
    sourceCitation: LIEBIG_CITATION
  };
};

export type AdviseAmendmentsResult = {
  readonly recommendations: ReadonlyArray<AmendmentRecommendation>;
  readonly summary: Summary;
};

/** Deterministic amendment planner. Pure function; no reasoning provider. */
export const adviseAmendments = (
  sample: SoilSample,
  speciesId: string
): AdviseAmendmentsResult => {
  const demand = lookupDemand(speciesId);
  if (!demand) {
    return {
      recommendations: [],
      summary: actionRequired(
        `No nutrient-demand record for species "${speciesId}". Add one to species-demand.ts.`
      )
    };
  }
  const limiting = computeLimitingFactor(sample, demand);
  if (!limiting) {
    return {
      recommendations: [],
      summary: success("Soil is within target for this species. No amendments needed.")
    };
  }
  const first = amendmentFor(limiting, demand);
  const recs: AmendmentRecommendation[] = [];
  if (first) {
    recs.push(first);
  }
  return {
    recommendations: recs,
    summary: actionRequired(`Primary limiting factor: ${limiting.code}. Address it first.`)
  };
};

const DAYS_PER_WEEK = 7;

/** Irrigation advisor returning mm/week target. Prepends a warning to the IrrigationAdvisory
 * when the climate point is the bundled fallback.
 */
export const adviseWater = (input: {
  readonly speciesId: string;
  readonly growthStage: GrowthStage;
  readonly climate: ClimatePoint;
}): IrrigationAdvisory => {
  const kc = lookupKc(input.speciesId, input.growthStage);
  if (kc === undefined) {
    return {
      speciesId: input.speciesId,
      growthStage: input.growthStage,
      et0MmPerDay: 0,
      kc: 0,
      mmPerWeek: 0,
      sourceCitation: kcSourceCitation,
      warning: actionRequired(`No Kc table entry for species "${input.speciesId}".`)
    };
  }
  const et0 = computeEt0(input.climate);
  const mmPerWeek = Number((et0 * kc * DAYS_PER_WEEK).toFixed(2));
  const baseAdvisory: IrrigationAdvisory = {
    speciesId: input.speciesId,
    growthStage: input.growthStage,
    et0MmPerDay: et0,
    kc,
    mmPerWeek,
    sourceCitation: `${kcSourceCitation} | ET₀: FAO-56 Penman-Monteith.`
  };
  if (input.climate.source === ClimateSource.ClimatologyFallback) {
    return {
      ...baseAdvisory,
      warning: warning(
        "Using Sofia-basin monthly averages; connect a weather station for precision."
      )
    };
  }
  return baseAdvisory;
};

export { SummaryType };
