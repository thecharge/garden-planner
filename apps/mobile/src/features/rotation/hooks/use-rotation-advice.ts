import { useQuery } from "@tanstack/react-query";
import { adviseRotation, speciesCatalogue } from "@garden/engine";
import type { AdviseRotationResult } from "@garden/engine";
import type { CropFamily } from "@garden/config";

export type UseRotationAdviceInput = {
  readonly sectorId: string;
  readonly currentYear: number;
  readonly sectorHistory: ReadonlyArray<{ family: CropFamily; year: number }>;
  readonly neighbourCurrentCrops: ReadonlyArray<string>;
};

export const useRotationAdvice = (input: UseRotationAdviceInput) =>
  useQuery<AdviseRotationResult>({
    queryKey: ["rotation", input.sectorId, input.currentYear],
    // adviseRotation is pure; running it through a queryFn gives us cache +
    // deterministic invalidation alongside the other TanStack-Query feature hooks.
    queryFn: async () =>
      adviseRotation({
        sectorHistory: input.sectorHistory,
        neighbourCurrentCrops: input.neighbourCurrentCrops,
        availableSpecies: speciesCatalogue,
        currentYear: input.currentYear
      })
  });
