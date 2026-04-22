import type { SummaryType } from "@garden/config";

/** One tap = 50 ms; gap = 80 ms. Consistent pattern per summary type per the
 * voice-interaction spec. Returned as a sequence of durations in milliseconds —
 * the consumer renders them via expo-haptics (or a web fallback).
 */
export type HapticPattern = ReadonlyArray<number>;

const SHORT = 50;
const GAP = 80;
const LONG = 400;

export const hapticPatternFor = (type: SummaryType): HapticPattern => {
  if (type === "success") {
    return [SHORT];
  }
  if (type === "warning") {
    return [SHORT, GAP, SHORT];
  }
  if (type === "actionRequired") {
    return [SHORT, GAP, SHORT, GAP, SHORT];
  }
  return [LONG];
};
