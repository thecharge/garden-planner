import { SpatialLimits } from "@garden/config";
import { rejection, warning, actionRequired } from "@garden/core";
import type { ComplianceRule, ScanData, Verdict } from "@garden/config";

/** Sofia-basin compliance rules.
 *
 * These are MVP advisory rules curated against public summaries of Sofia
 * Municipality planning code. Every non-success verdict the evaluator returns
 * carries the rule id and a reference field so a lawyer or municipal officer
 * can audit the call. Values live in @garden/config's SpatialLimits so they
 * are changeable in one place.
 *
 * None of these rules is legal advice. The disclaimer on every verdict says so.
 */

const DISCLAIMER = "Advisory only — verify with Sofia Municipality. Not legal advice.";

const setbackRule: ComplianceRule = {
  id: "sofia.setback.boundary",
  reference: "Sofia Municipality — property line setbacks (advisory summary).",
  check: (data: ScanData): Verdict => {
    if (data.distanceToPropertyLine >= SpatialLimits.MIN_SETBACK_METERS) {
      return null;
    }
    return rejection("Retaining wall breaches municipal setback limits.", {
      sourceRuleId: "sofia.setback.boundary",
      reference: "Sofia Municipality — property line setbacks (advisory summary).",
      disclaimer: DISCLAIMER
    });
  }
};

const slopeRule: ComplianceRule = {
  id: "sofia.slope.micro-permit",
  reference: "Sofia Municipality — slope modification permit thresholds.",
  check: (data: ScanData): Verdict => {
    if (data.slopeDegree <= SpatialLimits.MAX_UNPERMITTED_SLOPE) {
      return null;
    }
    return warning(
      `Slope exceeds ${SpatialLimits.MAX_UNPERMITTED_SLOPE} degrees. Micro-permit engineering specs generated.`,
      {
        sourceRuleId: "sofia.slope.micro-permit",
        reference: "Sofia Municipality — slope modification permit thresholds.",
        disclaimer: DISCLAIMER
      }
    );
  }
};

const waterTableRule: ComplianceRule = {
  id: "sofia.water-table.intervention",
  reference: "Sofia basin groundwater hints — advisory.",
  check: (data: ScanData): Verdict => {
    if (data.waterTableDepth >= SpatialLimits.SAFE_WATER_TABLE_DEPTH) {
      return null;
    }
    return actionRequired(
      "High water table detected. Recommend deep-rooting shrubs before grading.",
      {
        sourceRuleId: "sofia.water-table.intervention",
        reference: "Sofia basin groundwater hints — advisory.",
        disclaimer: DISCLAIMER
      }
    );
  }
};

/** Rules iterated in order. Highest-severity rules come first so early-return
 * picks up a rejection before a warning or actionRequired.
 */
export const sofiaRules: ReadonlyArray<ComplianceRule> = [setbackRule, slopeRule, waterTableRule];
