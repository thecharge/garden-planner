import { computeEt0 } from "../et0";
import type { ClimatePoint } from "@garden/config";

const sofiaBase: Omit<ClimatePoint, "tempMeanC" | "rhMeanPct" | "windMs" | "solarMjm2d" | "dayOfYear"> = {
  lat: 42.7,
  elevationM: 550,
  source: "climatology-fallback",
  sourceCitation: "Sofia-basin monthly climatology, bundled (see climate-fallback.ts)"
};

describe("computeEt0 (FAO-56 Penman-Monteith)", () => {
  const table: ReadonlyArray<
    readonly [label: string, point: ClimatePoint, band: readonly [number, number]]
  > = [
    [
      "Sofia July midsummer",
      {
        ...sofiaBase,
        dayOfYear: 196,
        tempMeanC: 22,
        rhMeanPct: 55,
        windMs: 2,
        solarMjm2d: 25
      },
      [3.0, 7.5]
    ],
    [
      "Sofia January midwinter",
      {
        ...sofiaBase,
        dayOfYear: 15,
        tempMeanC: -1,
        rhMeanPct: 80,
        windMs: 3,
        solarMjm2d: 5
      },
      [0.0, 1.5]
    ]
  ];

  it.each(table)("%s ET₀ falls in the expected band", (_label, point, [lo, hi]) => {
    const et0 = computeEt0(point);
    expect(et0).toBeGreaterThanOrEqual(lo);
    expect(et0).toBeLessThanOrEqual(hi);
    expect(Number.isFinite(et0)).toBe(true);
  });

  it("zero-wind chaos still returns a finite non-negative number", () => {
    const et0 = computeEt0({
      ...sofiaBase,
      dayOfYear: 180,
      tempMeanC: 20,
      rhMeanPct: 60,
      windMs: 0,
      solarMjm2d: 20
    });
    expect(et0).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(et0)).toBe(true);
  });
});
