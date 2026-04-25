import { DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";
import { SmepErrors } from "@garden/config";
import type { Protocol } from "@garden/config";
import { createProtocol } from "@garden/core";
import { config } from "@/core/config";

/** Sample emitted by the motion adapter. Pitch + heading are in radians to
 * match `expo-sensors` native shapes; the driver converts to degrees.
 */
export type MotionSample = {
  readonly pitchRad: number;
  readonly headingRad?: number;
};

export type MotionAdapter = {
  readonly isAvailable: () => Promise<boolean>;
  readonly setUpdateInterval: (ms: number) => void;
  readonly subscribe: (onSample: (s: MotionSample) => void) => () => void;
};

export type LocationFix = {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitudeMeters?: number;
};

export type LocationAdapter = {
  readonly fetchOnce: (timeoutMs: number) => Promise<LocationFix | null>;
};

export type CaptureOptions = {
  readonly windowMs?: number;
  readonly propertyLineDistanceMeters?: number;
  readonly waterTableDepthMeters?: number;
  readonly protocolId?: string;
  readonly now?: () => number;
  readonly signal?: AbortSignal;
};

export type CaptureDeps = {
  readonly motion: MotionAdapter;
  readonly location: LocationAdapter;
};

const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const computeConfidence = (pitches: ReadonlyArray<number>): number => {
  if (pitches.length === 0) {
    return 0;
  }
  const mean = pitches.reduce((acc, p) => acc + p, 0) / pitches.length;
  const variance = pitches.reduce((acc, p) => acc + (p - mean) ** 2, 0) / pitches.length;
  const raw = 1 - Math.min(variance, 1);
  return Math.max(0, Math.min(1, raw));
};

/** Real capture pipeline — fuses DeviceMotion + Location fix into a Protocol.
 *
 * Throws `SmepErrors.captureTooShort()` if no samples arrived during the
 * window. Missing optional fields (property-line distance, water-table depth,
 * location altitude) are left `undefined` so the compliance engine routes to
 * `actionRequired` rather than hallucinating a verdict.
 */
export const captureProtocol = async (
  deps: CaptureDeps,
  opts: CaptureOptions = {}
): Promise<Protocol> => {
  const windowMs = opts.windowMs ?? config.CAPTURE_WINDOW_MS;
  const now = opts.now ?? Date.now;

  const available = await deps.motion.isAvailable();
  if (!available) {
    throw SmepErrors.captureTooShort();
  }

  if (opts.signal?.aborted) {
    throw SmepErrors.captureTooShort();
  }

  const pitchSamples: number[] = [];
  const headingSamples: number[] = [];
  deps.motion.setUpdateInterval(100);
  const unsubscribe = deps.motion.subscribe((sample) => {
    if (Number.isFinite(sample.pitchRad)) {
      pitchSamples.push(sample.pitchRad);
    }
    if (sample.headingRad !== undefined && Number.isFinite(sample.headingRad)) {
      headingSamples.push(sample.headingRad);
    }
  });
  const locationPromise = deps.location.fetchOnce(3000);
  await sleep(windowMs);

  if (opts.signal?.aborted) {
    unsubscribe();
    throw SmepErrors.captureTooShort();
  }

  unsubscribe();

  if (pitchSamples.length === 0) {
    throw SmepErrors.captureTooShort();
  }

  const meanPitch = pitchSamples.reduce((a, p) => a + p, 0) / pitchSamples.length;
  const slopeDegree = Math.abs(radToDeg(meanPitch));
  const orientationDegrees =
    headingSamples.length > 0
      ? ((headingSamples.reduce((a, h) => a + h, 0) / headingSamples.length) * 180) / Math.PI
      : undefined;

  const location = await locationPromise;
  const elevationMeters = location?.altitudeMeters;

  const confidence = computeConfidence(pitchSamples);
  const capturedAt = new Date(now()).toISOString();
  const id = opts.protocolId ?? `scan-${String(now())}`;

  return createProtocol({
    id,
    capturedAt,
    confidence,
    data: {
      slopeDegree,
      ...(opts.propertyLineDistanceMeters !== undefined
        ? { distanceToPropertyLine: opts.propertyLineDistanceMeters }
        : {}),
      ...(opts.waterTableDepthMeters !== undefined
        ? { waterTableDepth: opts.waterTableDepthMeters }
        : {}),
      ...(orientationDegrees !== undefined ? { orientationDegrees } : {}),
      ...(elevationMeters !== undefined ? { elevationMeters } : {})
    }
  });
};

// --- Default Expo-backed adapters -----------------------------------------

type DeviceMotionPayload = {
  readonly rotation?: { readonly alpha?: number; readonly beta?: number };
};

export const expoMotionAdapter: MotionAdapter = {
  isAvailable: () => DeviceMotion.isAvailableAsync(),
  setUpdateInterval: (ms) => DeviceMotion.setUpdateInterval(ms),
  subscribe: (onSample) => {
    const subscription = DeviceMotion.addListener((data: DeviceMotionPayload) => {
      const beta = data.rotation?.beta;
      const alpha = data.rotation?.alpha;
      if (typeof beta === "number") {
        onSample({
          pitchRad: beta,
          ...(typeof alpha === "number" ? { headingRad: alpha } : {})
        });
      }
    });
    return () => subscription.remove();
  }
};

export const expoLocationAdapter: LocationAdapter = {
  fetchOnce: async (timeoutMs) => {
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        return {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          ...(typeof last.coords.altitude === "number"
            ? { altitudeMeters: last.coords.altitude }
            : {})
        };
      }
      const current = await Promise.race<Awaited<
        ReturnType<typeof Location.getCurrentPositionAsync>
      > | null>([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))
      ]);
      if (!current?.coords) {
        return null;
      }
      return {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        ...(typeof current.coords.altitude === "number"
          ? { altitudeMeters: current.coords.altitude }
          : {})
      };
    } catch {
      return null;
    }
  }
};
