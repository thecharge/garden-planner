import type { SummaryType } from "../enums";

/** Metadata attached to a Summary — never load-bearing, always informational. */
export type SummaryMeta = {
  readonly sourceRuleId?: string;
  readonly reference?: string;
  readonly disclaimer?: string;
  readonly supplier?: { readonly name: string; readonly pinId: string; readonly contact?: string };
  readonly factors?: readonly string[];
  readonly providerId?: string;
  [k: string]: unknown;
};

/** Canonical verdict object returned by every engine module. */
export type Summary = {
  readonly type: SummaryType;
  readonly message: string;
  readonly meta?: SummaryMeta;
};
