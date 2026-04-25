import { useStore } from "zustand";
import { useSectors } from "@/features/sectors";
import { spatialStore } from "@/engine/spatial-store";

const PLOT_ID = "plot-a";

export type HomeDashboardData = {
  readonly sectorCount: number;
  readonly lastScanSlope: number;
  readonly isLoading: boolean;
};

export const useHomeDashboard = (): HomeDashboardData => {
  const sectors = useSectors(PLOT_ID);
  const lastScanSlope = useStore(spatialStore, (s) => Math.abs(s.pose.pitchDeg));

  return {
    sectorCount: sectors.data?.length ?? 0,
    lastScanSlope,
    isLoading: sectors.isLoading
  };
};
