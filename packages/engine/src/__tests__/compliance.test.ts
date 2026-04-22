import { SmepError, SummaryType, TaskStatus } from "@garden/config";
import { evaluateTopographyCompliance } from "../compliance";
import { createMockMemoryRepo, createProtocol } from "./_test-utils";

describe("evaluateTopographyCompliance", () => {
  const cases: ReadonlyArray<
    readonly [
      label: string,
      data: Parameters<typeof createProtocol>[0],
      expectedStatus: string,
      expectedSummaryType: string
    ]
  > = [
    [
      "Happy Flow: perfectly flat, safe distance, good drainage",
      { distanceToPropertyLine: 5, slopeDegree: 5, waterTableDepth: 10 },
      TaskStatus.Verified,
      SummaryType.Success
    ],
    [
      "Side Flow: compliant but requires permit due to steep slope",
      { distanceToPropertyLine: 4, slopeDegree: 20, waterTableDepth: 8 },
      TaskStatus.PendingApproval,
      SummaryType.Warning
    ],
    [
      "Side Flow: compliant grading but requires biological water intervention",
      { distanceToPropertyLine: 6, slopeDegree: 10, waterTableDepth: 1 },
      TaskStatus.RequiresIntervention,
      SummaryType.ActionRequired
    ],
    [
      "Critical Path: illegal boundary breach",
      { distanceToPropertyLine: 0.5, slopeDegree: 10, waterTableDepth: 5 },
      TaskStatus.Failed,
      SummaryType.Rejection
    ]
  ];

  it.each(cases)(
    "given %s, it should evaluate correctly",
    async (_label, data, expectedStatus, expectedSummaryType) => {
      const repo = createMockMemoryRepo();
      const protocol = createProtocol(data);
      const result = await evaluateTopographyCompliance(protocol, repo);
      expect(result.type).toBe(expectedSummaryType);
      expect(repo.savedStatus.at(-1)?.status).toBe(expectedStatus);
    }
  );

  it("persists a micro-permit when the slope rule triggers", async () => {
    const repo = createMockMemoryRepo();
    const protocol = createProtocol({
      distanceToPropertyLine: 4,
      slopeDegree: 22,
      waterTableDepth: 8
    });
    await evaluateTopographyCompliance(protocol, repo);
    expect(repo.savedPermits).toContain("sofia.slope.micro-permit");
  });

  it("every non-success verdict carries a sourceRuleId, reference, and disclaimer", async () => {
    const repo = createMockMemoryRepo();
    const protocol = createProtocol({
      distanceToPropertyLine: 0.5,
      slopeDegree: 10,
      waterTableDepth: 5
    });
    const result = await evaluateTopographyCompliance(protocol, repo);
    expect(result.meta?.sourceRuleId).toBe("sofia.setback.boundary");
    expect(result.meta?.reference).toEqual(expect.any(String));
    expect(result.meta?.disclaimer).toEqual(expect.stringContaining("Sofia Municipality"));
  });

  it("throws SmepErrors.protocolEmpty when protocol data is missing", async () => {
    const repo = createMockMemoryRepo();
    await expect(
      evaluateTopographyCompliance({ data: null } as never, repo)
    ).rejects.toBeInstanceOf(SmepError);
  });
});
