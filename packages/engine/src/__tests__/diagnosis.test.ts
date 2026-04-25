import { SummaryType } from "@garden/config";
import { diagnosePin } from "../diagnosis";
import { createMockMemoryRepo } from "./_test-utils";

describe("diagnosePin", () => {
  it.each([
    [
      "happy: no evidence returns actionRequired",
      undefined,
      undefined,
      0,
      SummaryType.ActionRequired
    ],
    [
      "happy: shallow water table alone — single factor — returns success",
      0.5,
      undefined,
      0,
      SummaryType.Success
    ],
    [
      "side: high compaction alone — single factor — returns success",
      undefined,
      2500,
      0,
      SummaryType.Success
    ],
    [
      "side: single failure event alone returns success",
      undefined,
      undefined,
      1,
      SummaryType.Success
    ],
    ["critical: two factors returns actionRequired", 0.5, 2500, 0, SummaryType.ActionRequired],
    [
      "critical: water + failure returns actionRequired",
      0.5,
      undefined,
      1,
      SummaryType.ActionRequired
    ]
  ] as const)(
    "%s",
    async (_label, waterTableDepthMeters, compactionKpa, failureCount, expectedType) => {
      const base = createMockMemoryRepo();
      const failures = Array.from({ length: failureCount }, (_, i) => ({
        id: `ev-${i}`,
        kind: "PLANT_FAILURE" as const,
        capturedAt: "2026-01-01T00:00:00.000Z",
        delta: 1,
        pinId: "pin-1"
      }));

      const repoWithFailures = {
        ...base,
        listEventsByPin: async () => failures
      };

      const result = await diagnosePin({
        pinId: "pin-1",
        ...(waterTableDepthMeters !== undefined ? { waterTableDepthMeters } : {}),
        ...(compactionKpa !== undefined ? { compactionPenetrometerKpa: compactionKpa } : {}),
        memoryRepository: repoWithFailures
      });

      expect(result.type).toBe(expectedType);
    }
  );
});
