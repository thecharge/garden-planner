/** Cross-package numeric and identifier constants.
 *
 * Sofia-basin municipal limits are advisory MVP values. Every non-success
 * compliance verdict must carry a `sourceRuleId` + `reference` citation —
 * these numbers are the starting points for those rules, not legal facts.
 */

export const SpatialLimits = {
  /** Minimum setback from a property boundary (metres). Advisory; verify with Sofia Municipality Article 40 setbacks. */
  MIN_SETBACK_METERS: 3.0,
  /** Maximum unpermitted slope for a retaining/terracing action (degrees). Above this, micro-permit required. */
  MAX_UNPERMITTED_SLOPE: 15.0,
  /** Safe water-table depth from surface before biological intervention is recommended (metres). */
  SAFE_WATER_TABLE_DEPTH: 2.0
} as const;

/** Default Anthropic model id.
 *
 * Upgrade is a single-line edit to this constant. `anthropicProvider` reads it,
 * never a hard-coded string. See D25 + the reasoning-provider spec.
 */
export const ANTHROPIC_MODEL_ID = "claude-sonnet-4-6" as const;

/** Minimum capture-window duration (milliseconds) before a Protocol is accepted. */
export const MIN_CAPTURE_WINDOW_MS = 3000 as const;

/** Minimum scan confidence for a verdict to be produced without a re-scan warning. */
export const MIN_SCAN_CONFIDENCE = 0.5 as const;
