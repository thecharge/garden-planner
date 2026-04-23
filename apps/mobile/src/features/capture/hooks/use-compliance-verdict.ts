import { useMutation } from "@tanstack/react-query";
import { evaluateTopographyCompliance } from "@garden/engine";
import type { Protocol, Summary } from "@garden/config";
import { summary } from "@garden/core";
import { getMemoryRepository } from "@/core/query/repository";
import { createLogger } from "@/core/logger";
import { useAnnounce } from "@/core/announce";

const log = createLogger("capture");

/** useComplianceVerdict — TanStack Query mutation wrapping the pure engine call.
 * Announces the resulting Summary on every settle (success or failure).
 */
export const useComplianceVerdict = () => {
  const announce = useAnnounce();
  return useMutation<Summary, Error, Protocol>({
    mutationFn: async (protocol) => {
      const repo = await getMemoryRepository();
      return evaluateTopographyCompliance(protocol, repo);
    },
    onSuccess: (result) => {
      void announce(result);
    },
    onError: (err) => {
      log.warn("compliance verdict failed", { name: err.name });
      void announce(summary.actionRequired("Scan failed. Re-pan the slope and try again."));
    }
  });
};
