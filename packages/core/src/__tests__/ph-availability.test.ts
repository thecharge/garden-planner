import { NutrientCode } from "@garden/config";
import { availabilityAtPh, phInRange } from "../ph-availability";

describe("availabilityAtPh", () => {
  it.each([
    ["Nitrogen at optimal pH 7.0 is 1.0", NutrientCode.Nitrogen, 7.0, 1.0],
    ["Nitrogen at low pH 4.0 returns low value", NutrientCode.Nitrogen, 4.0, 0.1],
    ["Phosphorus at optimal pH 6.5 is 1.0", NutrientCode.Phosphorus, 6.5, 1.0]
  ] as const)("%s", (_label, nutrient, pH, expected) => {
    expect(availabilityAtPh(nutrient, pH)).toBeCloseTo(expected, 5);
  });

  it("side: interpolates between curve points", () => {
    const val = availabilityAtPh(NutrientCode.Nitrogen, 5.5);
    expect(val).toBeGreaterThan(0.5);
    expect(val).toBeLessThan(0.9);
  });

  it("side: clamps below the first curve point", () => {
    const val = availabilityAtPh(NutrientCode.Nitrogen, 0);
    expect(val).toBe(availabilityAtPh(NutrientCode.Nitrogen, 4.0));
  });

  it("side: clamps above the last curve point", () => {
    const val = availabilityAtPh(NutrientCode.Nitrogen, 100);
    expect(val).toBe(availabilityAtPh(NutrientCode.Nitrogen, 9.0));
  });
});

describe("phInRange", () => {
  it.each([
    ["inside range", 6.5, [6.0, 7.0] as const, true],
    ["at lower bound", 6.0, [6.0, 7.0] as const, true],
    ["at upper bound", 7.0, [6.0, 7.0] as const, true],
    ["below range", 5.9, [6.0, 7.0] as const, false],
    ["above range", 7.1, [6.0, 7.0] as const, false]
  ] as const)("%s", (_label, pH, range, expected) => {
    expect(phInRange(pH, range)).toBe(expected);
  });
});
