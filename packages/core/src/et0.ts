import type { ClimatePoint } from "@garden/config";

/** FAO-56 Penman-Monteith reference evapotranspiration (ET₀), mm/day.
 *
 * Source: Allen, Pereira, Raes & Smith (1998), "Crop evapotranspiration —
 * Guidelines for computing crop water requirements", FAO Irrigation and
 * Drainage Paper 56. https://www.fao.org/3/x0490e/x0490e00.htm
 *
 * This is the short-crop grass reference (hypothetical reference surface:
 * 0.12 m height, surface resistance 70 s/m, albedo 0.23). Feed the result
 * into Kc tables for a specific crop/growth-stage irrigation target.
 */

const TO_RADIANS = Math.PI / 180;

const saturationVaporPressure = (tempC: number): number =>
  0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));

const slopeVaporPressureCurve = (tempC: number): number => {
  const es = saturationVaporPressure(tempC);
  return (4098 * es) / Math.pow(tempC + 237.3, 2);
};

const solarDeclination = (dayOfYear: number): number =>
  0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);

const sunsetHourAngle = (latRad: number, declination: number): number => {
  const x = -Math.tan(latRad) * Math.tan(declination);
  const clamped = Math.max(-1, Math.min(1, x));
  return Math.acos(clamped);
};

const inverseRelativeEarthSunDistance = (dayOfYear: number): number =>
  1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);

const extraterrestrialRadiation = (latRad: number, dayOfYear: number): number => {
  const dr = inverseRelativeEarthSunDistance(dayOfYear);
  const decl = solarDeclination(dayOfYear);
  const ws = sunsetHourAngle(latRad, decl);
  const term =
    ws * Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.sin(ws);
  return ((24 * 60) / Math.PI) * 0.082 * dr * term;
};

const netRadiation = (solarMjm2d: number, raMjm2d: number, tempC: number, rhPct: number): number => {
  const rns = 0.77 * solarMjm2d;
  const rso = 0.75 * raMjm2d;
  const ea = (rhPct / 100) * saturationVaporPressure(tempC);
  const tk4 = Math.pow(tempC + 273.16, 4);
  const rnl =
    4.903e-9 *
    tk4 *
    (0.34 - 0.14 * Math.sqrt(Math.max(0, ea))) *
    (1.35 * Math.min(1, solarMjm2d / Math.max(1e-6, rso)) - 0.35);
  return rns - rnl;
};

const atmosphericPressure = (elevationM: number): number =>
  101.3 * Math.pow((293 - 0.0065 * elevationM) / 293, 5.26);

const psychrometricConstant = (elevationM: number): number => 0.000665 * atmosphericPressure(elevationM);

/** Compute ET₀ (mm/day) for a single climate point. */
export const computeEt0 = (point: ClimatePoint): number => {
  const latRad = point.lat * TO_RADIANS;
  const es = saturationVaporPressure(point.tempMeanC);
  const ea = (point.rhMeanPct / 100) * es;
  const delta = slopeVaporPressureCurve(point.tempMeanC);
  const gamma = psychrometricConstant(point.elevationM);
  const ra = extraterrestrialRadiation(latRad, point.dayOfYear);
  const rn = netRadiation(point.solarMjm2d, ra, point.tempMeanC, point.rhMeanPct);
  const numerator =
    0.408 * delta * rn +
    (gamma * (900 / (point.tempMeanC + 273)) * point.windMs * (es - ea));
  const denominator = delta + gamma * (1 + 0.34 * point.windMs);
  const et0 = numerator / denominator;
  return Math.max(0, Number(et0.toFixed(3)));
};
