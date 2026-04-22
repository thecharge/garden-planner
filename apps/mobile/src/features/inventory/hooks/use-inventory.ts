import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryEvent, InventoryRecord } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";

const invKey = ["inventory"] as const;

export const useInventory = () =>
  useQuery<ReadonlyArray<InventoryRecord>>({
    queryKey: invKey,
    queryFn: async () => {
      // MemoryRepository on device is the pure-JS adapter in repository.ts;
      // it does not persist raw inventory-record rows. A future
      // make-device-sqlite-adapter change wires a real expo-sqlite backing
      // and re-exposes listInventoryRecords.
      await getMemoryRepository();
      return [];
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
