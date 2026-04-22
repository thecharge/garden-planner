import {
  ClimateSource,
  GrowthStage,
  LimitingFactorCode,
  NutrientCode,
  SoilTexture,
  SummaryType
} from "@garden/config";
import type { SoilSample } from "@garden/config";
import { adviseAmendments, adviseWater } from "../nutrient/advisor";
import { sofiaFallbackClimate } from "../nutrient/climate-fallback";
import { computeLimitingFactor } from "../nutrient/liebig";
import { lookupDemand } from "../nutrient/species-demand";

const baseSample = (overrides: Partial<SoilSample> = {}): SoilSample => ({
  id: "s-1",
  capturedAt: "2026-03-01T00:00:00.000Z",
  pH: 6.5,
  texture: SoilTexture.Loam,
  npk: { n: 100, p: 60, k: 200 },
  ...overrides
});

describe("adviseAmendments", () => {
  const cases: ReadonlyArray<
    readonly [
      label: string,
      sample: SoilSample,
      speciesId: string,
      expectedLeading: LimitingFactorCode | "NONE"
    ]
  > = [
    [
      "N-limiting for tomato",
      baseSample({ npk: { n: 30, p: 60, k: 200 } }),
      "tomato-san-marzano",
      LimitingFactorCode.Nitrogen
    ],
    [
      "pH too low for cabbage (target 6.5-7.5)",
      baseSample({ pH: 5.0 }),
      "cabbage-savoy",
      LimitingFactorCode.PH
    ],
    [
      "already adequate → success",
      baseSample({ npk: { n: 200, p: 100, k: 250 } }),
      "tomato-san-marzano",
      "NONE"
    ],
    ["missing species → actionRequired", baseSample(), "unknown-species", "NONE"]
  ];

  it.each(cases)("%s", (_label, sample, speciesId, expectedLeading) => {
    const result = adviseAmendments(sample, speciesId);
    if (expectedLeading === "NONE") {
      expect(result.recommendations).toHaveLength(0);
      return;
    }
    expect(result.recommendations[0]?.nutrient).toBe(expectedLeading);
    expect(result.recommendations[0]?.sourceCitation.length).toBeGreaterThan(0);
  });
});

describe("computeLimitingFactor", () => {
  it("returns null when all targets are met", () => {
    const demand = lookupDemand("tomato-san-marzano")!;
    const sample = baseSample({ npk: { n: 200, p: 100, k: 250 } });
    expect(computeLimitingFactor(sample, demand)).toBeNull();
  });

  it("picks the largest normalised shortfall", () => {
    const demand = lookupDemand("tomato-san-marzano")!;
    const sample = baseSample({ npk: { n: 20, p: 70, k: 200 } });
    const limiting = computeLimitingFactor(sample, demand);
    expect(limiting?.code).toBe(NutrientCode.Nitrogen);
  });
});

describe("adviseWater", () => {
  const climate = sofiaFallbackClimate(196);

  it("returns mm/week based on ET₀ * Kc * 7", () => {
    const result = adviseWater({
      speciesId: "tomato-san-marzano",
      growthStage: GrowthStage.MidSeason,
      climate
    });
    expect(result.mmPerWeek).toBeGreaterThan(0);
    expect(result.kc).toBeCloseTo(1.15, 2);
    expect(result.sourceCitation).toContain("FAO-56");
  });

  it("prepends a warning when using the climatology fallback", () => {
    const result = adviseWater({
      speciesId: "tomato-san-marzano",
      growthStage: GrowthStage.MidSeason,
      climate
    });
    expect(result.warning).toBeDefined();
    expect(result.warning?.type).toBe(SummaryType.Warning);
  });

  it("no warning when using a live-station climate point", () => {
    const result = adviseWater({
      speciesId: "tomato-san-marzano",
      growthStage: GrowthStage.MidSeason,
      climate: {
        ...climate,
        source: ClimateSource.LiveStation,
        sourceCitation: "Local station"
      }
    });
    expect(result.warning).toBeUndefined();
  });

  it("missing Kc returns an actionRequired warning and zeros", () => {
    const result = adviseWater({
      speciesId: "unknown-species",
      growthStage: GrowthStage.MidSeason,
      climate
    });
    expect(result.kc).toBe(0);
    expect(result.warning?.type).toBe(SummaryType.ActionRequired);
  });
});
