import { shouldAdvancePose } from "../pose-throttle";
import type { SpatialPose } from "../spatial-store";

const base: SpatialPose = {
  pitchDeg: 10,
  yawDeg: 10,
  rollDeg: 10,
  x: 0,
  y: 0,
  z: 0,
  confidence: 1,
  updatedAt: 0
};

describe("shouldAdvancePose", () => {
  const cases: ReadonlyArray<readonly [label: string, next: SpatialPose, expected: boolean]> = [
    ["sub-threshold rotation → no", { ...base, pitchDeg: 10.3 }, false],
    ["≥ 1° rotation → yes", { ...base, pitchDeg: 11.1 }, true],
    ["≥ 0.1 m translation → yes", { ...base, x: 0.2 }, true],
    ["equal pose → no", base, false]
  ];
  it.each(cases)("%s", (_label, next, expected) => {
    expect(shouldAdvancePose(base, next)).toBe(expected);
  });

  it("60 Hz stream with only sub-threshold drift yields zero advances", () => {
    let advances = 0;
    let last = base;
    for (let i = 0; i < 60; i += 1) {
      const next: SpatialPose = { ...base, pitchDeg: 10 + 0.01 * i };
      if (shouldAdvancePose(last, next)) {
        advances += 1;
        last = next;
      }
    }
    // Total 0.6° drift across 60 samples stays under the 1° threshold.
    expect(advances).toBe(0);
  });
});
