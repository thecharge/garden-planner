import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryEvent, InventoryRecord } from "@garden/config";
import { summary } from "@garden/core";
import { getMemoryRepository } from "@/core/query/repository";
import { useAnnounce } from "@/core/announce";

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
  const announce = useAnnounce();
  return useMutation<void, Error, InventoryRecord>({
    mutationFn: async (record) => {
      const repo = await getMemoryRepository();
      await repo.saveInventoryRecord(record);
    },
    onSuccess: (_v, record) => {
      void qc.invalidateQueries({ queryKey: invKey });
      void announce(summary.success(`Saved ${record.quantity} ${record.unit} of ${record.name}`));
    },
    onError: () => {
      void announce(summary.actionRequired("Could not save record. Try again."));
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
  const announce = useAnnounce();
  return useMutation<void, Error, InventoryEvent>({
    mutationFn: async (event) => {
      const repo = await getMemoryRepository();
      await repo.appendEvent(event);
    },
    onSuccess: (_v, event) => {
      void qc.invalidateQueries({ queryKey: ["inventory-events"] });
      void announce(summary.success(`Event logged (${event.kind})`));
    },
    onError: () => {
      void announce(summary.actionRequired("Could not log event. Try again."));
    }
  });
};
