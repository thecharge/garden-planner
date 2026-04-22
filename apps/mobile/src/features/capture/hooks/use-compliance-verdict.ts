import { useMutation } from "@tanstack/react-query";
import { evaluateTopographyCompliance } from "@garden/engine";
import type { Protocol, Summary } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";
import { createLogger } from "@/core/logger";

const log = createLogger("capture");

/** useComplianceVerdict — TanStack Query mutation wrapping the pure engine call.
 *
 * UI component reads `{ mutate, isPending, error, data }` and never manages its
 * own loading state. On error we log (never the key, just the provider id) and
 * let the UI translate via `announce(summary.actionRequired(...))`.
 */
export const useComplianceVerdict = () =>
  useMutation<Summary, Error, Protocol>({
    mutationFn: async (protocol) => {
      const repo = await getMemoryRepository();
      return evaluateTopographyCompliance(protocol, repo);
    },
    onError: (err) => {
      log.warn("compliance verdict failed", { name: err.name });
    }
  });
