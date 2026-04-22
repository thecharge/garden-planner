import { useQuery } from "@tanstack/react-query";
import {
  adviseAmendments,
  adviseWater,
  sofiaFallbackClimate
} from "@garden/engine";
import type { GrowthStage, SoilSample } from "@garden/config";

export const useAmendmentPlan = (
  sample: SoilSample | undefined,
  speciesId: string
) =>
  useQuery({
    enabled: Boolean(sample),
    queryKey: ["nutrient", sample?.id, speciesId],
    queryFn: async () => adviseAmendments(sample as SoilSample, speciesId)
  });

export const useIrrigationTarget = (
  speciesId: string,
  growthStage: GrowthStage,
  dayOfYear: number
) =>
  useQuery({
    queryKey: ["irrigation", speciesId, growthStage, dayOfYear],
    queryFn: async () =>
      adviseWater({
        speciesId,
        growthStage,
        climate: sofiaFallbackClimate(dayOfYear)
      })
  });
