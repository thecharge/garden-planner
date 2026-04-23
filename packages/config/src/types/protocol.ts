import type { SoilTexture, TaskStatus } from "../enums";

/** The raw numeric scan payload a Protocol carries.
 *
 * Only `slopeDegree` is REQUIRED — it is the single value the sensor fusion
 * can always provide from camera + DeviceMotion. Every other field is optional
 * and sourced from user-confirmed pins (property line, water table) or
 * supplemental sensors (GPS, barometer, soil samples). The compliance engine
 * treats missing optional fields as "unknown constraint" and routes to
 * `summary.actionRequired(...)` rather than silently passing.
 */
export type ScanData = {
  /** Average pitch of the scanned slope across the capture window, degrees. */
  readonly slopeDegree: number;
  /** Perpendicular distance from the scan point to the nearest property-line polygon edge, metres. */
  readonly distanceToPropertyLine?: number;
  /** Depth from surface to water table, metres. Higher means drier. */
  readonly waterTableDepth?: number;
  /** Compass orientation of the scan, degrees. 0 = north, 90 = east. */
  readonly orientationDegrees?: number;
  /** Elevation above sea level, metres. */
  readonly elevationMeters?: number;
  /** References to soil samples recorded at this scan site. */
  readonly soilSampleIds?: readonly string[];
  /** Soil texture hint captured inline when no full sample exists. */
  readonly soilType?: SoilTexture;
};

/** Canonical plot-scan object emitted by the capture driver.
 *
 * Every engine module in @garden/engine consumes this shape. Not a class —
 * values are plain data so they round-trip through SQLite and JSON without ceremony.
 */
export type Protocol = {
  readonly id: string;
  readonly capturedAt: string;
  /** 0.0 – 1.0 fused confidence (sensor variance, GPS accuracy, capture duration). */
  readonly confidence: number;
  readonly data: ScanData;
};

/** A plot scan plus the lifecycle status assigned by the most recent evaluation. */
export type ScanRecord = {
  readonly protocol: Protocol;
  readonly status: TaskStatus;
};

/** A boundary polygon walked by the user for a plot. */
export type BoundaryPolygon = {
  readonly plotId: string;
  readonly corners: ReadonlyArray<{ lat: number; lon: number }>;
  readonly capturedAt: string;
};
