/** Cross-package enums.
 *
 * The single source of truth for state values the app moves between.
 * No package may redefine these; no feature may store raw string literals in their place.
 *
 * Pattern everywhere (required by `code-conventions-strict`):
 *
 *   export const X = { PascalLabel: "VALUE" } as const;
 *   export type X = (typeof X)[keyof typeof X];
 *
 * Keys are PascalCase descriptive labels (e.g., `SameFamilyTooSoon`).
 * Values are SCREAMING_SNAKE_CASE for persisted codes, kebab-case for ids
 * that surface in filenames or persisted settings (e.g., `"light-pastel"`).
 */

export const TaskStatus = {
  InProgress: "IN_PROGRESS",
  Verified: "VERIFIED",
  PendingApproval: "PENDING_APPROVAL",
  RequiresIntervention: "REQUIRES_INTERVENTION",
  Failed: "FAILED"
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const EventKind = {
  Acquired: "ACQUIRED",
  Sowed: "SOWED",
  Transplanted: "TRANSPLANTED",
  Harvested: "HARVESTED",
  PestObserved: "PEST_OBSERVED",
  SoilSample: "SOIL_SAMPLE",
  Correction: "CORRECTION",
  PlantFailure: "PLANT_FAILURE"
} as const;
export type EventKind = (typeof EventKind)[keyof typeof EventKind];

export const CropFamily = {
  Solanaceae: "SOLANACEAE",
  Brassicaceae: "BRASSICACEAE",
  Fabaceae: "FABACEAE",
  Cucurbitaceae: "CUCURBITACEAE",
  Apiaceae: "APIACEAE",
  Poaceae: "POACEAE",
  Alliaceae: "ALLIACEAE",
  Asteraceae: "ASTERACEAE",
  Rosaceae: "ROSACEAE"
} as const;
export type CropFamily = (typeof CropFamily)[keyof typeof CropFamily];

export const NutrientCode = {
  Nitrogen: "N",
  Phosphorus: "P",
  Potassium: "K",
  Calcium: "CA",
  Magnesium: "MG",
  Sulfur: "S",
  Boron: "B",
  Iron: "FE",
  Manganese: "MN",
  Zinc: "ZN",
  Copper: "CU",
  Molybdenum: "MO"
} as const;
export type NutrientCode = (typeof NutrientCode)[keyof typeof NutrientCode];

export const SummaryType = {
  Success: "success",
  Warning: "warning",
  ActionRequired: "actionRequired",
  Rejection: "rejection"
} as const;
export type SummaryType = (typeof SummaryType)[keyof typeof SummaryType];

/** Soil textures used across protocol capture, sector samples, and species fit. */
export const SoilTexture = {
  Clay: "clay",
  Loam: "loam",
  Sandy: "sandy",
  Chalky: "chalky",
  Peaty: "peaty",
  Silty: "silty"
} as const;
export type SoilTexture = (typeof SoilTexture)[keyof typeof SoilTexture];

/** Orientation-of-site fit declared by species records. */
export const OrientationFit = {
  Any: "any",
  Sun: "sun",
  Shade: "shade",
  Dappled: "dappled"
} as const;
export type OrientationFit = (typeof OrientationFit)[keyof typeof OrientationFit];

/** The diagnostic codes the nutrient advisor emits as "most-limiting factor".
 * Superset of `NutrientCode` plus `PH` which is a soil-chemistry directive,
 * not a nutrient element. Keeps `NutrientCode` clean while giving the advisor
 * a single exhaustive type to switch on.
 */
export const LimitingFactorCode = {
  ...NutrientCode,
  PH: "PH"
} as const;
export type LimitingFactorCode = (typeof LimitingFactorCode)[keyof typeof LimitingFactorCode];

/** Font families bundled with the mobile app. Used by theme tokens and the
 * settings store. Values match the font family names loaded via `expo-font`.
 */
export const FontFamily = {
  Lexend: "Lexend",
  OpenDyslexic: "OpenDyslexic"
} as const;
export type FontFamily = (typeof FontFamily)[keyof typeof FontFamily];
