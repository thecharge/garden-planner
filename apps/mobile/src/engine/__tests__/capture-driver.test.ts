import { SmepError } from "@garden/config";
import {
  captureProtocol,
  type MotionAdapter,
  type LocationAdapter,
  type MotionSample
} from "../capture-driver";

const makeMotion = (samples: ReadonlyArray<MotionSample>, available = true): MotionAdapter => ({
  isAvailable: async () => available,
  setUpdateInterval: () => undefined,
  subscribe: (onSample) => {
    for (const s of samples) {
      onSample(s);
    }
    return () => undefined;
  }
});

const fixedLocation: LocationAdapter = {
  fetchOnce: async () => ({
    latitude: 42.64,
    longitude: 23.5,
    altitudeMeters: 580
  })
};

const nullLocation: LocationAdapter = {
  fetchOnce: async () => null
};

describe("captureProtocol", () => {
  it("happy: fused slope + orientation + altitude produce a valid Protocol", async () => {
    const samples: MotionSample[] = [
      { pitchRad: 0.2, headingRad: 1.0 },
      { pitchRad: 0.2, headingRad: 1.0 },
      { pitchRad: 0.2, headingRad: 1.0 }
    ];
    const p = await captureProtocol(
      { motion: makeMotion(samples), location: fixedLocation },
      { windowMs: 5, propertyLineDistanceMeters: 3, waterTableDepthMeters: 6, now: () => 0 }
    );
    expect(p.data.slopeDegree).toBeCloseTo(11.459, 2); // 0.2 rad ≈ 11.46°
    expect(p.data.orientationDegrees).toBeCloseTo(57.2957, 2); // 1 rad ≈ 57.3°
    expect(p.data.distanceToPropertyLine).toBe(3);
    expect(p.data.waterTableDepth).toBe(6);
    expect(p.data.elevationMeters).toBe(580);
    expect(p.confidence).toBeGreaterThan(0.9);
  });

  it("side: null location still yields a Protocol with elevationMeters undefined", async () => {
    const samples: MotionSample[] = [{ pitchRad: 0.1 }, { pitchRad: 0.15 }];
    const p = await captureProtocol(
      { motion: makeMotion(samples), location: nullLocation },
      { windowMs: 5, now: () => 1 }
    );
    expect(p.data.slopeDegree).toBeGreaterThan(0);
    expect(p.data.elevationMeters).toBeUndefined();
    expect(p.data.orientationDegrees).toBeUndefined();
    // Optional fields not provided by opts stay undefined so the engine routes
    // to actionRequired rather than passing.
    expect(p.data.distanceToPropertyLine).toBeUndefined();
    expect(p.data.waterTableDepth).toBeUndefined();
  });

  it("critical: zero samples throws SmepErrors.captureTooShort", async () => {
    const motion = makeMotion([]);
    await expect(
      captureProtocol({ motion, location: fixedLocation }, { windowMs: 5 })
    ).rejects.toBeInstanceOf(SmepError);
  });

  it("critical: DeviceMotion unavailable throws SmepErrors.captureTooShort", async () => {
    const motion = makeMotion([{ pitchRad: 0.1 }], false);
    await expect(
      captureProtocol({ motion, location: fixedLocation }, { windowMs: 5 })
    ).rejects.toBeInstanceOf(SmepError);
  });

  it("chaos: non-finite pitch samples are ignored but a finite one still completes", async () => {
    const samples: MotionSample[] = [
      { pitchRad: Number.NaN },
      { pitchRad: Number.POSITIVE_INFINITY },
      { pitchRad: 0.3 }
    ];
    const p = await captureProtocol(
      { motion: makeMotion(samples), location: fixedLocation },
      { windowMs: 5, now: () => 2 }
    );
    expect(p.data.slopeDegree).toBeCloseTo(17.188, 2); // only the finite 0.3 counted
  });
});
