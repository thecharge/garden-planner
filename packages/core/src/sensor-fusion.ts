import { SmepErrors } from "@garden/config";

/** Circular mean is overkill for pitch (bounded to -90..+90); a plain arithmetic mean is correct. */
export const averagePitch = (samples: ReadonlyArray<number>): number => {
  if (samples.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const value of samples) {
    if (!Number.isFinite(value)) {
      continue;
    }
    sum += value;
  }
  return sum / samples.length;
};

export type ConfidenceInput = {
  /** Variance of the pitch samples across the capture window. Higher = noisier. */
  readonly variance: number;
  /** GPS accuracy in metres. Lower = better. */
  readonly gpsAccuracy: number;
  /** Total capture-window duration in milliseconds. */
  readonly durationMs: number;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Fused scan confidence in [0, 1]. Throws on zero-duration chaos. */
export const scanConfidence = (input: ConfidenceInput): number => {
  if (!Number.isFinite(input.durationMs) || input.durationMs <= 0) {
    throw SmepErrors.captureTooShort();
  }
  const durationScore = clamp01(input.durationMs / 5000);
  const varianceScore = clamp01(1 - input.variance / 25);
  const gpsScore = clamp01(1 - input.gpsAccuracy / 20);
  return Number((durationScore * 0.3 + varianceScore * 0.4 + gpsScore * 0.3).toFixed(4));
};
