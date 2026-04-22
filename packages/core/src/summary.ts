import { SummaryType } from "@garden/config";
import type { Summary, SummaryMeta } from "@garden/config";

/** Build a success Summary. */
export const success = (message: string, meta?: SummaryMeta): Summary => ({
  type: SummaryType.Success,
  message,
  ...(meta === undefined ? {} : { meta })
});

/** Build a warning Summary (advisory; action optional). */
export const warning = (message: string, meta?: SummaryMeta): Summary => ({
  type: SummaryType.Warning,
  message,
  ...(meta === undefined ? {} : { meta })
});

/** Build an actionRequired Summary (user input needed to proceed). */
export const actionRequired = (message: string, meta?: SummaryMeta): Summary => ({
  type: SummaryType.ActionRequired,
  message,
  ...(meta === undefined ? {} : { meta })
});

/** Build a rejection Summary (the plan is not permitted). */
export const rejection = (message: string, meta?: SummaryMeta): Summary => ({
  type: SummaryType.Rejection,
  message,
  ...(meta === undefined ? {} : { meta })
});

/** Namespaced helper so callsites read like `summary.success(...)` per the example. */
export const summary = {
  success,
  warning,
  actionRequired,
  rejection
} as const;
