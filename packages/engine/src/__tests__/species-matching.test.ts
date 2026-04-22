import { SoilTexture, SummaryType } from "@garden/config";
import type { SoilSample } from "@garden/config";
import { matchSpeciesToSite } from "../species-matching";
import { speciesCatalogue } from "../data/species";
import { createProtocol } from "./_test-utils";

describe("matchSpeciesToSite", () => {
  const cases: ReadonlyArray<
    readonly [
      label: string,
      data: Parameters<typeof createProtocol>[0],
      soil: SoilSample | undefined,
      expectedTopId: string | "no-match"
    ]
  > = [
    [
      "pooling water site → willow leads",
      {
        distanceToPropertyLine: 4,
        slopeDegree: 5,
        waterTableDepth: 0.3,
        soilType: SoilTexture.Clay
      },
      undefined,
      "willow-goat"
    ],
    [
      "happy loam site with neutral pH → tomato is among top",
      {
        distanceToPropertyLine: 5,
        slopeDegree: 5,
        waterTableDepth: 5,
        soilType: SoilTexture.Loam
      },
      {
        id: "s-1",
        pH: 6.5,
        texture: SoilTexture.Loam,
        capturedAt: "2026-04-22T10:00:00.000Z"
      },
      "tomato-san-marzano"
    ],
    [
      "shallow water table + clay → willow leads",
      {
        distanceToPropertyLine: 5,
        slopeDegree: 8,
        waterTableDepth: 0.5,
        soilType: SoilTexture.Clay
      },
      undefined,
      "willow-goat"
    ]
  ];

  it.each(cases)("%s", (_label, data, soil, expectedTopId) => {
    const protocol = createProtocol(data);
    const result = matchSpeciesToSite(protocol, speciesCatalogue, soil);
    if (expectedTopId === "no-match") {
      expect(result.kind).toBe("no-match");
      return;
    }
    expect(result.kind).toBe("matches");
    if (result.kind === "matches") {
      expect(result.ranking[0]?.speciesId).toBe(expectedTopId);
    }
  });

  it("returns actionRequired when no species scores above zero", () => {
    const protocol = createProtocol({
      distanceToPropertyLine: 5,
      slopeDegree: 89,
      waterTableDepth: -1,
      soilType: SoilTexture.Chalky
    });
    const result = matchSpeciesToSite(protocol, [], undefined);
    expect(result.kind).toBe("no-match");
    if (result.kind === "no-match") {
      expect(result.summary.type).toBe(SummaryType.ActionRequired);
    }
  });
});
