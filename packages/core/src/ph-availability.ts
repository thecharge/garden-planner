import { NutrientCode } from "@garden/config";
import type { NutrientCode as NutrientCodeT } from "@garden/config";

/** Nutrient availability as a function of soil pH.
 *
 * Based on the Truog (1946) availability chart as reproduced in standard
 * agronomy references (e.g., Brady & Weil, "The Nature and Properties of
 * Soils", 15th ed., chapter 9). Availability peaks near pH 6.0–7.0 for
 * most macronutrients; iron/manganese become limited at high pH; phosphorus
 * availability drops below pH 6 and above pH 7.5.
 *
 * This is an advisory curve, not a lab assay. Values are normalised to [0, 1].
 */

type Curve = ReadonlyArray<readonly [pH: number, availability: number]>;

const curves: Readonly<Record<NutrientCodeT, Curve>> = {
  [NutrientCode.Nitrogen]: [
    [4.0, 0.1],
    [5.0, 0.5],
    [6.0, 0.9],
    [7.0, 1.0],
    [8.0, 0.7],
    [9.0, 0.3]
  ],
  [NutrientCode.Phosphorus]: [
    [4.0, 0.1],
    [5.5, 0.4],
    [6.5, 1.0],
    [7.5, 0.6],
    [8.5, 0.2]
  ],
  [NutrientCode.Potassium]: [
    [4.0, 0.3],
    [5.5, 0.7],
    [6.5, 1.0],
    [8.0, 0.9],
    [9.0, 0.6]
  ],
  [NutrientCode.Calcium]: [
    [4.0, 0.1],
    [5.5, 0.4],
    [7.0, 1.0],
    [8.5, 1.0]
  ],
  [NutrientCode.Magnesium]: [
    [4.0, 0.1],
    [5.5, 0.5],
    [7.0, 1.0],
    [8.5, 1.0]
  ],
  [NutrientCode.Sulfur]: [
    [4.0, 0.3],
    [6.0, 1.0],
    [8.0, 1.0]
  ],
  [NutrientCode.Boron]: [
    [4.0, 0.4],
    [6.5, 1.0],
    [7.5, 0.7],
    [8.5, 0.3]
  ],
  [NutrientCode.Iron]: [
    [4.0, 1.0],
    [6.0, 0.8],
    [7.0, 0.4],
    [8.0, 0.1]
  ],
  [NutrientCode.Manganese]: [
    [4.0, 1.0],
    [6.0, 0.7],
    [7.5, 0.2],
    [8.5, 0.1]
  ],
  [NutrientCode.Zinc]: [
    [4.0, 0.9],
    [6.0, 0.7],
    [7.5, 0.3],
    [8.5, 0.1]
  ],
  [NutrientCode.Copper]: [
    [4.0, 0.8],
    [6.0, 0.6],
    [7.5, 0.3],
    [8.5, 0.1]
  ],
  [NutrientCode.Molybdenum]: [
    [4.0, 0.1],
    [6.0, 0.7],
    [7.5, 1.0],
    [8.5, 1.0]
  ]
};

/** Linear interpolation across a curve. */
export const availabilityAtPh = (nutrient: NutrientCodeT, pH: number): number => {
  const curve = curves[nutrient];
  if (!curve || curve.length === 0) {
    return 0;
  }
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (!first || !last) {
    return 0;
  }
  if (pH <= first[0]) {
    return first[1];
  }
  if (pH >= last[0]) {
    return last[1];
  }
  for (let i = 0; i < curve.length - 1; i += 1) {
    const lower = curve[i];
    const upper = curve[i + 1];
    if (!lower || !upper) {
      continue;
    }
    if (pH >= lower[0] && pH <= upper[0]) {
      const span = upper[0] - lower[0];
      const t = span === 0 ? 0 : (pH - lower[0]) / span;
      return lower[1] + t * (upper[1] - lower[1]);
    }
  }
  return 0;
};

/** True when pH is within a species-accepted pH band. */
export const phInRange = (pH: number, range: readonly [number, number]): boolean =>
  pH >= range[0] && pH <= range[1];
