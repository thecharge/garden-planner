import { EventKind, SpatialLimits } from "@garden/config";
import { actionRequired, success } from "@garden/core";
import type { MemoryRepository } from "@garden/memory";
import type { Summary } from "@garden/config";

export type DiagnoseInput = {
  readonly pinId: string;
  readonly waterTableDepthMeters?: number;
  readonly compactionPenetrometerKpa?: number;
  readonly memoryRepository: MemoryRepository;
};

/** "Why does everything die here?" diagnosis.
 *
 * Composes water table + compaction + historical PLANT_FAILURE events for a pin.
 * Returns actionRequired when evidence is thin rather than fabricating a verdict.
 */
export const diagnosePin = async (input: DiagnoseInput): Promise<Summary> => {
  const events = await input.memoryRepository.listEventsByPin(input.pinId);
  const failures = events.filter((e) => e.kind === EventKind.PlantFailure);
  const factors: string[] = [];

  if (
    input.waterTableDepthMeters !== undefined &&
    input.waterTableDepthMeters < SpatialLimits.SAFE_WATER_TABLE_DEPTH
  ) {
    factors.push(`water table ${input.waterTableDepthMeters}m (shallow)`);
  }
  if (
    input.compactionPenetrometerKpa !== undefined &&
    input.compactionPenetrometerKpa > 2000
  ) {
    factors.push(`soil compaction ${input.compactionPenetrometerKpa} kPa (high)`);
  }
  if (failures.length > 0) {
    factors.push(`${failures.length} prior plant-failure event(s) logged here`);
  }

  if (factors.length === 0) {
    return actionRequired(
      "Not enough evidence to diagnose. Record a soil sample or log plant-failure events.",
      { factors: [] }
    );
  }

  if (factors.length >= 2) {
    return actionRequired(
      "This site has multiple stress factors. Consider deep-rooting, water-hungry shrubs to drain it.",
      { factors }
    );
  }

  return success(`Only one factor detected: ${factors[0]}. Monitor before intervening.`, {
    factors
  });
};
