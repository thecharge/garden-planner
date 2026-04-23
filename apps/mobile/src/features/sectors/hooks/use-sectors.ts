import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Sector } from "@garden/config";
import { summary } from "@garden/core";
import { getMemoryRepository } from "@/core/query/repository";
import { useAnnounce } from "@/core/announce";

const sectorsKey = (plotId: string) => ["sectors", plotId] as const;
const sectorKey = (id: string) => ["sector", id] as const;

export const useSectors = (plotId: string) =>
  useQuery<ReadonlyArray<Sector>>({
    queryKey: sectorsKey(plotId),
    queryFn: async () => {
      const repo = await getMemoryRepository();
      return repo.listSectorsByPlot(plotId);
    }
  });

export const useSector = (id: string) =>
  useQuery<Sector | null>({
    queryKey: sectorKey(id),
    queryFn: async () => {
      const repo = await getMemoryRepository();
      const found = await repo.getSector(id);
      return found ?? null;
    }
  });

export const useSaveSector = (plotId: string) => {
  const qc = useQueryClient();
  const announce = useAnnounce();
  return useMutation<void, Error, Sector>({
    mutationFn: async (sector) => {
      const repo = await getMemoryRepository();
      await repo.saveSector(sector);
    },
    onSuccess: (_v, sector) => {
      void qc.invalidateQueries({ queryKey: sectorsKey(plotId) });
      void announce(summary.success(`Sector "${sector.name}" saved`));
    },
    onError: () => {
      void announce(summary.actionRequired("Could not save sector. Try again."));
    }
  });
};

export const useRenameSector = (plotId: string) => {
  const qc = useQueryClient();
  const announce = useAnnounce();
  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const repo = await getMemoryRepository();
      await repo.renameSector(id, name);
    },
    onSuccess: (_v, variables) => {
      void qc.invalidateQueries({ queryKey: sectorsKey(plotId) });
      void qc.invalidateQueries({ queryKey: sectorKey(variables.id) });
      void announce(summary.success(`Renamed to "${variables.name}"`));
    },
    onError: () => {
      void announce(summary.actionRequired("Could not rename sector. Try again."));
    }
  });
};

export const useDeleteSector = (plotId: string) => {
  const qc = useQueryClient();
  const announce = useAnnounce();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const repo = await getMemoryRepository();
      await repo.deleteSector(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sectorsKey(plotId) });
      void announce(summary.success("Sector deleted"));
    },
    onError: () => {
      void announce(summary.actionRequired("Could not delete sector. Try again."));
    }
  });
};
