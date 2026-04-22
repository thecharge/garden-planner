import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { heatmapData, yieldBySectorAndYear } from "@garden/engine";
import type { HeatmapTile } from "@garden/engine";
import type { Harvest } from "@garden/config";
import { getMemoryRepository } from "@/core/query/repository";

export const useSectorYield = (sectorId: string, year: number) =>
  useQuery<ReadonlyMap<string, number>>({
    queryKey: ["yield", sectorId, year],
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return yieldBySectorAndYear(repo, sectorId, year);
    }
  });

export const useHeatmap = (plotId: string, year: number) =>
  useQuery<ReadonlyArray<HeatmapTile>>({
    queryKey: ["heatmap", plotId, year],
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return heatmapData(repo, plotId, year);
    }
  });

export const useHarvestsBySector = (sectorId: string) =>
  useQuery<ReadonlyArray<Harvest>>({
    queryKey: ["harvests", sectorId],
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return repo.listHarvestsBySector(sectorId);
    }
  });

export const useAppendHarvest = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, Harvest>({
    mutationFn: async (h) => {
      const repo = await getMemoryRepository();
      await repo.appendHarvest(h);
    },
    onSuccess: (_v, h) => {
      void qc.invalidateQueries({ queryKey: ["harvests", h.sectorId] });
      void qc.invalidateQueries({ queryKey: ["heatmap"] });
      void qc.invalidateQueries({ queryKey: ["yield", h.sectorId] });
    }
  });
};
