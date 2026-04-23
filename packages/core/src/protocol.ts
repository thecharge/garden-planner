import { SmepErrors } from "@garden/config";
import type { Protocol, ScanData } from "@garden/config";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const requiredScanKeys: ReadonlyArray<keyof ScanData> = ["slopeDegree"];

const optionalNumericKeys: ReadonlyArray<keyof ScanData> = [
  "distanceToPropertyLine",
  "waterTableDepth",
  "orientationDegrees",
  "elevationMeters"
];

/** Validate the numeric invariants of a ScanData block. Only `slopeDegree` is
 * required; optional numeric fields must be finite numbers when present. Throws
 * SmepErrors.protocolEmpty on failure.
 */
export const validateScanData = (data: unknown): data is ScanData => {
  if (data === null || data === undefined || typeof data !== "object") {
    throw SmepErrors.protocolEmpty();
  }
  const record = data as Record<string, unknown>;
  for (const key of requiredScanKeys) {
    if (!isFiniteNumber(record[key])) {
      throw SmepErrors.protocolEmpty();
    }
  }
  for (const key of optionalNumericKeys) {
    if (record[key] !== undefined && !isFiniteNumber(record[key])) {
      throw SmepErrors.protocolEmpty();
    }
  }
  return true;
};

export type ProtocolInput = {
  readonly id: string;
  readonly capturedAt: string;
  readonly confidence: number;
  readonly data: ScanData;
};

/** Construct a Protocol, validating inputs. */
export const createProtocol = (input: ProtocolInput): Protocol => {
  if (!input || !input.id || !input.capturedAt) {
    throw SmepErrors.protocolEmpty();
  }
  if (!isFiniteNumber(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    throw SmepErrors.protocolEmpty();
  }
  validateScanData(input.data);
  return {
    id: input.id,
    capturedAt: input.capturedAt,
    confidence: input.confidence,
    data: input.data
  };
};
