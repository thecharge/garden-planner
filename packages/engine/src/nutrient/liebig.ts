import { LimitingFactorCode, NutrientCode } from "@garden/config";
import type { SoilSample, SpeciesDemand } from "@garden/config";

export type LimitingFactor = {
  readonly code: LimitingFactorCode;
  readonly shortfallNormalised: number;
  readonly currentValue: number | undefined;
  readonly targetValue: number;
};

/** Liebig's Law of the Minimum — Sprengel–Liebig (1828/1840): yield is bounded
 * by the most-limiting nutrient, not the sum of all. See Brady & Weil,
 * "The Nature and Properties of Soils", chapter 12.
 *
 * Returns the single most-limiting factor across N/P/K and pH. Returns null
 * when nothing is below target.
 */
export const computeLimitingFactor = (
  sample: SoilSample,
  demand: SpeciesDemand
): LimitingFactor | null => {
  const candidates: LimitingFactor[] = [];

  const addNpk = (code: LimitingFactorCode, current: number | undefined, target: number): void => {
    if (current === undefined) {
      return;
    }
    const shortfall = Math.max(0, (target - current) / target);
    if (shortfall > 0) {
      candidates.push({
        code,
        shortfallNormalised: shortfall,
        currentValue: current,
        targetValue: target
      });
    }
  };

  // pH is surfaced before NPK per the nutrient-advisor spec: nothing else
  // matters until pH is in range because pH gates NPK availability itself.
  const phMin = demand.targetPhRange[0];
  const phMax = demand.targetPhRange[1];
  if (sample.pH < phMin) {
    return {
      code: LimitingFactorCode.PH,
      shortfallNormalised: (phMin - sample.pH) / phMin,
      currentValue: sample.pH,
      targetValue: phMin
    };
  }
  if (sample.pH > phMax) {
    return {
      code: LimitingFactorCode.PH,
      shortfallNormalised: (sample.pH - phMax) / phMax,
      currentValue: sample.pH,
      targetValue: phMax
    };
  }

  addNpk(NutrientCode.Nitrogen, sample.npk?.n, demand.targetNpk.n);
  addNpk(NutrientCode.Phosphorus, sample.npk?.p, demand.targetNpk.p);
  addNpk(NutrientCode.Potassium, sample.npk?.k, demand.targetNpk.k);

  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => b.shortfallNormalised - a.shortfallNormalised);
  return candidates[0] ?? null;
};
