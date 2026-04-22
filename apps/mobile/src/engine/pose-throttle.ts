import { config } from "@/core/config";
import type { SpatialPose } from "./spatial-store";

/** Decide whether the displayed pose should advance given the last-rendered
 * pose and a new sample. Thresholds come from `core/config.ts`. Pure function
 * so unit-testable; the React hook that uses it lives in engine/use-throttled-pose.ts.
 */
export const shouldAdvancePose = (previous: SpatialPose, next: SpatialPose): boolean => {
  const degDelta = Math.max(
    Math.abs(next.pitchDeg - previous.pitchDeg),
    Math.abs(next.yawDeg - previous.yawDeg),
    Math.abs(next.rollDeg - previous.rollDeg)
  );
  if (degDelta >= config.POSE_THROTTLE_DEG) {
    return true;
  }
  const metreDelta = Math.max(
    Math.abs(next.x - previous.x),
    Math.abs(next.y - previous.y),
    Math.abs(next.z - previous.z)
  );
  return metreDelta >= config.POSE_THROTTLE_METERS;
};
