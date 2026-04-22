import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Sector } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";

const sectorsKey = (plotId: string) => ["sectors", plotId] as const;

export const useSectors = (plotId: string) =>
  useQuery<ReadonlyArray<Sector>>({
    queryKey: sectorsKey(plotId),
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return repo.listSectorsByPlot(plotId);
    }
  });

export const useSaveSector = (plotId: string) => {
  const qc = useQueryClient();
  return useMutation<void, Error, Sector>({
    mutationFn: async (sector) => {
      const repo = await getMemoryRepository();
      await repo.saveSector(sector);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sectorsKey(plotId) });
    }
  });
};
