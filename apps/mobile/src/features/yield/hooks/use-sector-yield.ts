import { useQuery } from "@tanstack/react-query";
import { heatmapData, yieldBySectorAndYear } from "@garden/engine";
import type { HeatmapTile } from "@garden/engine";
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
