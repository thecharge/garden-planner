import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryEvent, InventoryRecord } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";

const invKey = ["inventory"] as const;
const eventsKey = (fromIso: string, toIso: string) => ["inventory-events", fromIso, toIso] as const;

export const useInventory = () =>
  useQuery<ReadonlyArray<InventoryRecord>>({
    queryKey: invKey,
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return repo.listInventoryRecords();
    }
  });

export const useSaveInventoryRecord = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, InventoryRecord>({
    mutationFn: async (record) => {
      const repo = await getMemoryRepository();
      await repo.saveInventoryRecord(record);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: invKey });
    }
  });
};

export const useEventsInRange = (fromIso: string, toIso: string) =>
  useQuery<ReadonlyArray<InventoryEvent>>({
    queryKey: eventsKey(fromIso, toIso),
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return repo.listEventsInRange(fromIso, toIso);
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
      void qc.invalidateQueries({ queryKey: ["inventory-events"] });
    }
  });
};
