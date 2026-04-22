import { SmepError } from "@garden/config";
import { averagePitch, scanConfidence } from "../sensor-fusion";

describe("averagePitch", () => {
  it("returns 0 on empty input", () => {
    expect(averagePitch([])).toBe(0);
  });

  it("averages finite samples", () => {
    expect(averagePitch([5, 10, 15])).toBeCloseTo(10);
  });

  it("ignores non-finite samples via the accumulator guard", () => {
    // Non-finite values contribute 0 to the sum; divisor is still samples.length.
    expect(averagePitch([10, Number.NaN, 20])).toBeCloseTo(10);
  });
});

describe("scanConfidence", () => {
  const table: ReadonlyArray<
    readonly [
      name: string,
      input: Parameters<typeof scanConfidence>[0],
      band: readonly [number, number]
    ]
  > = [
    ["high", { variance: 1, gpsAccuracy: 2, durationMs: 5000 }, [0.8, 1.0]],
    ["low", { variance: 20, gpsAccuracy: 18, durationMs: 1500 }, [0.0, 0.45]],
    ["borderline", { variance: 10, gpsAccuracy: 8, durationMs: 3000 }, [0.45, 0.8]]
  ];

  it.each(table)("%s confidence falls in the expected band", (_name, input, band) => {
    const c = scanConfidence(input);
    expect(c).toBeGreaterThanOrEqual(band[0]);
    expect(c).toBeLessThanOrEqual(band[1]);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1);
  });

  it("throws captureTooShort on zero-duration chaos", () => {
    expect(() => scanConfidence({ variance: 1, gpsAccuracy: 2, durationMs: 0 })).toThrow(SmepError);
  });
});
