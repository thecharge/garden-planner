import { ClimateSource } from "@garden/config";
import type { ClimatePoint } from "@garden/config";

/** Sofia-basin monthly climatology. Advisory fallback for offline irrigation
 * advice when no live weather is available. Values approximate the 1991-2020
 * normals for Sofia (WMO station index 15613). Source reviewer should confirm
 * before public release.
 */
type MonthlyNorm = {
  readonly tempMeanC: number;
  readonly rhMeanPct: number;
  readonly windMs: number;
  readonly solarMjm2d: number;
};

const sofiaNorms: ReadonlyArray<MonthlyNorm> = [
  { tempMeanC: -1.4, rhMeanPct: 82, windMs: 1.8, solarMjm2d: 4.2 }, // Jan
  { tempMeanC: 0.7, rhMeanPct: 76, windMs: 2.0, solarMjm2d: 7.1 }, // Feb
  { tempMeanC: 5.0, rhMeanPct: 70, windMs: 2.1, solarMjm2d: 11.2 }, // Mar
  { tempMeanC: 10.3, rhMeanPct: 66, windMs: 2.0, solarMjm2d: 15.8 }, // Apr
  { tempMeanC: 15.0, rhMeanPct: 68, windMs: 1.8, solarMjm2d: 19.6 }, // May
  { tempMeanC: 18.7, rhMeanPct: 67, windMs: 1.7, solarMjm2d: 22.1 }, // Jun
  { tempMeanC: 21.0, rhMeanPct: 63, windMs: 1.7, solarMjm2d: 23.8 }, // Jul
  { tempMeanC: 20.8, rhMeanPct: 62, windMs: 1.6, solarMjm2d: 21.7 }, // Aug
  { tempMeanC: 16.1, rhMeanPct: 68, windMs: 1.5, solarMjm2d: 16.4 }, // Sep
  { tempMeanC: 10.4, rhMeanPct: 75, windMs: 1.5, solarMjm2d: 10.5 }, // Oct
  { tempMeanC: 4.8, rhMeanPct: 82, windMs: 1.6, solarMjm2d: 5.6 }, // Nov
  { tempMeanC: 0.1, rhMeanPct: 85, windMs: 1.7, solarMjm2d: 3.7 } // Dec
];

const monthFromDayOfYear = (doy: number): number => {
  const cumulativeDays = [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  for (let i = 0; i < cumulativeDays.length; i += 1) {
    const limit = cumulativeDays[i];
    if (limit !== undefined && doy <= limit) {
      return i;
    }
  }
  return 11;
};

export const SOFIA_CLIMATOLOGY_CITATION =
  "Sofia-basin monthly climatology (WMO 15613) — 1991–2020 normals approximation.";

/** Build a ClimatePoint from the Sofia-basin fallback for a given day-of-year. */
export const sofiaFallbackClimate = (dayOfYear: number): ClimatePoint => {
  const idx = monthFromDayOfYear(dayOfYear);
  const norms = sofiaNorms[idx] ?? sofiaNorms[0];
  if (!norms) {
    return {
      lat: 42.7,
      elevationM: 550,
      dayOfYear,
      tempMeanC: 10,
      rhMeanPct: 70,
      windMs: 2,
      solarMjm2d: 12,
      source: ClimateSource.ClimatologyFallback,
      sourceCitation: SOFIA_CLIMATOLOGY_CITATION
    };
  }
  return {
    lat: 42.7,
    elevationM: 550,
    dayOfYear,
    tempMeanC: norms.tempMeanC,
    rhMeanPct: norms.rhMeanPct,
    windMs: norms.windMs,
    solarMjm2d: norms.solarMjm2d,
    source: "climatology-fallback",
    sourceCitation: SOFIA_CLIMATOLOGY_CITATION
  };
};
