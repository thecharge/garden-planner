import { useQuery } from "@tanstack/react-query";
import { yoyBySectorAndSpecies } from "@garden/engine";
import type { YoyRow } from "@garden/engine";
import { getMemoryRepository } from "@/core/query/repository";

export const useYoy = (plotId: string, year: number) =>
  useQuery<ReadonlyArray<YoyRow>>({
    queryKey: ["yoy", plotId, year],
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return yoyBySectorAndSpecies(repo, plotId, year);
    }
  });
