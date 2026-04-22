import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listInventoryRecords } from "@garden/memory";
import type { InventoryEvent, InventoryRecord } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";
import { createLogger } from "@/core/logger";

const log = createLogger("inventory");
const invKey = ["inventory"] as const;

export const useInventory = () =>
  useQuery<ReadonlyArray<InventoryRecord>>({
    queryKey: invKey,
    queryFn: async () => {
      const repo = await getMemoryRepository();
      // `listInventoryRecords` is a helper that runs over the underlying SqliteLike
      // adapter. We don't expose it on the MemoryRepository surface to keep that
      // interface narrow — features reach it via the memory package directly.
      const anyRepo = repo as unknown as { sqlite?: Parameters<typeof listInventoryRecords>[0] };
      if (!anyRepo.sqlite) {
        log.warn("inventory listing: repository adapter does not expose sqlite; returning empty");
        return [];
      }
      return listInventoryRecords(anyRepo.sqlite);
    }
  });

export const useAppendEvent = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, InventoryEvent>({
    mutationFn: async (event) => {
      const repo = await getMemoryRepository();
      await repo.appendEvent(event);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: invKey });
    }
  });
};
