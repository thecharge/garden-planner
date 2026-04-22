import type { ScanData } from "./protocol";
import type { Summary } from "./summary";

/** A verdict emitted by a single compliance rule. Null means "this rule had nothing to say". */
export type Verdict = Summary | null;

/** A typed, reviewable compliance rule. */
export type ComplianceRule = {
  readonly id: string;
  readonly reference: string;
  readonly check: (data: ScanData) => Verdict;
};

/** A generated micro-permit spec persisted when the slope rule triggers. */
export type PermitSpec = {
  readonly id: string;
  readonly scanId: string;
  readonly ruleId: string;
  readonly generatedAt: string;
  readonly body: string;
};
