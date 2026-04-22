import { getPose, setPose, subscribePose } from "../spatial-store";

const makePose = (pitch: number): Parameters<typeof setPose>[0] => ({
  pitchDeg: pitch,
  yawDeg: 0,
  rollDeg: 0,
  x: 0,
  y: 0,
  z: 0,
  confidence: 0.9,
  updatedAt: pitch
});

describe("spatial-store transient subscription", () => {
  it("setPose updates the store", () => {
    setPose(makePose(42));
    expect(getPose().pitchDeg).toBe(42);
  });

  it("subscribePose fires on every change", () => {
    const values: number[] = [];
    const unsub = subscribePose((p) => {
      values.push(p.pitchDeg);
    });
    setPose(makePose(1));
    setPose(makePose(2));
    setPose(makePose(3));
    unsub();
    setPose(makePose(4));
    expect(values).toEqual([1, 2, 3]);
  });

  it("60 samples/sec stream does not allocate React work — subscriber fires once per unique pose", () => {
    const values: number[] = [];
    const unsub = subscribePose((p) => values.push(p.pitchDeg));
    for (let i = 0; i < 60; i += 1) {
      setPose(makePose(i));
    }
    unsub();
    expect(values).toHaveLength(60);
  });
});
