import { SmepErrors, SummaryType, TaskStatus } from "@garden/config";
import { success } from "@garden/core";
import type { MemoryRepository } from "@garden/memory";
import type { PermitSpec, Protocol, Summary } from "@garden/config";
import { sofiaRules } from "./rules/sofia";

const SLOPE_RULE_ID = "sofia.slope.micro-permit";

const statusForSummaryType = (type: SummaryType): TaskStatus => {
  if (type === SummaryType.Success) {
    return TaskStatus.Verified;
  }
  if (type === SummaryType.Warning) {
    return TaskStatus.PendingApproval;
  }
  if (type === SummaryType.ActionRequired) {
    return TaskStatus.RequiresIntervention;
  }
  return TaskStatus.Failed;
};

const generatePermitSpec = (scanId: string, ruleId: string): PermitSpec => ({
  id: `permit-${scanId}-${ruleId}`,
  scanId,
  ruleId,
  generatedAt: new Date().toISOString(),
  body: `Micro-permit engineering spec for scan ${scanId} (rule: ${ruleId}). Submit to Sofia Municipality for approval.`
});

/** The canonical compliance entry point — matches the user's example file shape.
 *
 * Early-return guard, then each rule in order. Max 2 nesting levels; no else if;
 * no switch; const arrow. Every non-success verdict carries its sourceRuleId
 * and reference.
 */
export const evaluateTopographyCompliance = async (
  plotScan: Protocol,
  memoryRepository: MemoryRepository
): Promise<Summary> => {
  if (!plotScan || !plotScan.data) {
    throw SmepErrors.protocolEmpty();
  }

  for (const rule of sofiaRules) {
    const verdict = rule.check(plotScan.data);
    if (!verdict) {
      continue;
    }
    await memoryRepository.saveStatus(plotScan.id, statusForSummaryType(verdict.type));
    if (rule.id === SLOPE_RULE_ID) {
      await memoryRepository.savePermitSpec(generatePermitSpec(plotScan.id, rule.id));
    }
    return verdict;
  }

  await memoryRepository.saveStatus(plotScan.id, TaskStatus.Verified);
  return success("Grading plan is compliant and ecologically sound.");
};
