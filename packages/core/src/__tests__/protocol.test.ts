import { SmepError } from "@garden/config";
import { createProtocol, validateScanData } from "../protocol";

const baseData = {
  distanceToPropertyLine: 5,
  slopeDegree: 10,
  waterTableDepth: 4
};

describe("createProtocol", () => {
  const valid = {
    id: "p-1",
    capturedAt: "2026-04-22T10:00:00.000Z",
    confidence: 0.9,
    data: baseData
  };

  const tableInvalid: ReadonlyArray<
    readonly [name: string, override: Partial<typeof valid>]
  > = [
    ["missing id", { id: "" }],
    ["confidence out of range", { confidence: 1.5 }],
    ["non-finite confidence", { confidence: Number.NaN }]
  ];

  it("returns a frozen-shape Protocol on the happy path", () => {
    const p = createProtocol(valid);
    expect(p.id).toBe("p-1");
    expect(p.data.slopeDegree).toBe(10);
    expect(p.confidence).toBeCloseTo(0.9);
  });

  it.each(tableInvalid)("throws on %s", (_name, override) => {
    expect(() => createProtocol({ ...valid, ...override })).toThrow(SmepError);
  });

  it("throws protocolEmpty when data is null", () => {
    expect(() =>
      createProtocol({ ...valid, data: null as never })
    ).toThrow(SmepError);
  });
});

describe("validateScanData", () => {
  const tableBad: ReadonlyArray<readonly [name: string, data: unknown]> = [
    ["null", null],
    ["undefined", undefined],
    ["empty object", {}],
    ["missing slopeDegree", { distanceToPropertyLine: 1, waterTableDepth: 2 }],
    ["non-finite field", { distanceToPropertyLine: 1, slopeDegree: Infinity, waterTableDepth: 2 }],
    ["primitive", "not-an-object"]
  ];

  it("accepts a complete ScanData", () => {
    expect(validateScanData(baseData)).toBe(true);
  });

  it.each(tableBad)("throws on %s", (_name, data) => {
    expect(() => validateScanData(data)).toThrow(SmepError);
  });
});
