import type { LimitingFactorCode, NutrientCode } from "../enums";
import type { Summary } from "./summary";

export type NutrientAmounts = Readonly<Partial<Record<NutrientCode, number>>>;

export type SpeciesDemand = {
  readonly speciesId: string;
  readonly targetNpk: { readonly n: number; readonly p: number; readonly k: number };
  readonly targetPhRange: readonly [number, number];
  readonly microTargets?: NutrientAmounts;
  readonly sourceCitation: string;
};

export const NutrientUnit = {
  GramsPerSquareMeter: "g/m²",
  KilogramsPerHectare: "kg/ha",
  UnitsPerSquareMeter: "units/m²"
} as const;
export type NutrientUnit = (typeof NutrientUnit)[keyof typeof NutrientUnit];

export type AmendmentRecommendation = {
  readonly nutrient: LimitingFactorCode;
  readonly amount: number;
  readonly unit: NutrientUnit;
  readonly rationale: string;
  readonly sourceCitation: string;
};

export const ClimateSource = {
  LiveStation: "live-station",
  ClimatologyFallback: "climatology-fallback"
} as const;
export type ClimateSource = (typeof ClimateSource)[keyof typeof ClimateSource];

/** One climate data point used by ET0 calculation. Source tagged so fallback is visible. */
export type ClimatePoint = {
  readonly lat: number;
  readonly elevationM: number;
  readonly dayOfYear: number;
  readonly tempMeanC: number;
  readonly rhMeanPct: number;
  readonly windMs: number;
  readonly solarMjm2d: number;
  readonly source: ClimateSource;
  readonly sourceCitation: string;
};

export const GrowthStage = {
  Initial: "initial",
  Development: "development",
  MidSeason: "mid-season",
  LateSeason: "late-season"
} as const;
export type GrowthStage = (typeof GrowthStage)[keyof typeof GrowthStage];

export type IrrigationAdvisory = {
  readonly speciesId: string;
  readonly growthStage: GrowthStage;
  readonly et0MmPerDay: number;
  readonly kc: number;
  readonly mmPerWeek: number;
  readonly sourceCitation: string;
  readonly warning?: Summary;
};
