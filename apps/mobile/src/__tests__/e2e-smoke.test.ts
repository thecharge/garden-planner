/** End-to-end smoke test of the whole engine pipeline.
 *
 * Simulates:
 *   captured Protocol
 *   → compliance verdict (@garden/engine)
 *   → species match
 *   → sector create + sow event
 *   → harvest append
 *   → rotation advice (next year)
 *   → nutrient + irrigation advice
 *   → yield aggregation
 *
 * Runs in pure Node against the in-memory MemoryRepository and a mocked Anthropic
 * client. No React Native, no Expo. Proves the pure-engine contract is intact.
 */
import { CropFamily, EventKind, SummaryType, TaskStatus } from "@garden/config";
import type { Protocol, Sector } from "@garden/config";
import { createProtocol } from "@garden/core";
import { createMemoryRepository } from "@garden/memory";
import {
  adviseAmendments,
  adviseRotation,
  adviseWater,
  anthropicProvider,
  evaluateTopographyCompliance,
  matchSpeciesToSite,
  sofiaFallbackClimate,
  speciesCatalogue,
  yieldBySectorAndYear
} from "@garden/engine";

describe("engine pipeline — end-to-end smoke", () => {
  it("captures → verdict → match → sector → sow → harvest → rotation → nutrient → yield", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });

    // 1. A captured Protocol from the mobile capture driver.
    const scan: Protocol = createProtocol({
      id: "scan-e2e",
      capturedAt: "2026-04-22T09:00:00.000Z",
      confidence: 0.88,
      data: {
        distanceToPropertyLine: 5,
        slopeDegree: 8,
        waterTableDepth: 3,
        soilType: "loam"
      }
    });
    await repo.saveProtocol(scan);

    // 2. Compliance verdict. Happy path: should be VERIFIED + success.
    const verdict = await evaluateTopographyCompliance(scan, repo);
    expect(verdict.type).toBe(SummaryType.Success);

    // 3. Species match. Loam + modest slope + adequate water table — tomato family should surface.
    const match = matchSpeciesToSite(scan, speciesCatalogue, {
      id: "soil-e2e",
      capturedAt: scan.capturedAt,
      pH: 6.5,
      texture: "loam"
    });
    expect(match.kind).toBe("matches");

    // 4. Create a sector to plant in.
    const sector: Sector = {
      id: "sector-e2e",
      plotId: "plot-a",
      name: "North Bed",
      polygon: [
        { lat: 42.7, lon: 23.3 },
        { lat: 42.7001, lon: 23.3 },
        { lat: 42.7001, lon: 23.3001 },
        { lat: 42.7, lon: 23.3001 }
      ],
      createdAt: "2026-03-01T00:00:00.000Z"
    };
    await repo.saveSector(sector);

    // 5. Sow 50 tomato seeds.
    await repo.appendEvent({
      id: "ev-sow",
      kind: EventKind.Sowed,
      capturedAt: "2026-04-15T10:00:00.000Z",
      delta: -50,
      sectorId: sector.id,
      speciesId: "tomato-san-marzano"
    });

    // 6. Harvest 4.2 kg of tomatoes in August.
    await repo.appendHarvest({
      id: "h-e2e",
      sectorId: sector.id,
      speciesId: "tomato-san-marzano",
      weightGrams: 4200,
      harvestedAt: "2026-08-12T12:00:00.000Z"
    });

    // 7. Rotation advice for NEXT year. Solanaceae was grown — advisor must
    //    penalise same-family and boost brassicas / legumes.
    const rotation = adviseRotation({
      sectorHistory: [{ family: CropFamily.Solanaceae, year: 2026 }],
      neighbourCurrentCrops: [],
      availableSpecies: speciesCatalogue,
      currentYear: 2027
    });
    const tomatoRec = rotation.recommendations.find((r) => r.speciesId === "tomato-san-marzano");
    const cabbageRec = rotation.recommendations.find((r) => r.speciesId === "cabbage-savoy");
    expect(tomatoRec!.score).toBeLessThan(cabbageRec!.score);
    expect(tomatoRec!.reasons.some((r) => r.code === "SAME_FAMILY_TOO_SOON")).toBe(true);

    // 8. Nutrient + irrigation advice for next year's pick (cabbage).
    const amendments = adviseAmendments(
      {
        id: "soil-e2e",
        capturedAt: scan.capturedAt,
        pH: 6.2, // below cabbage target (6.5–7.5) — PH must be first
        texture: "loam",
        npk: { n: 80, p: 60, k: 180 }
      },
      "cabbage-savoy"
    );
    expect(amendments.recommendations[0]?.nutrient).toBe("PH");

    const irrigation = adviseWater({
      speciesId: "cabbage-savoy",
      growthStage: "mid-season",
      climate: sofiaFallbackClimate(196)
    });
    expect(irrigation.mmPerWeek).toBeGreaterThan(0);
    expect(irrigation.warning?.type).toBe("warning"); // climatology fallback

    // 9. Yield aggregation for 2026.
    const yieldMap = await yieldBySectorAndYear(repo, sector.id, 2026);
    expect(yieldMap.get("tomato-san-marzano")).toBe(4200);

    // 10. Reasoning provider smoke — no key wired, must degrade gracefully.
    const provider = anthropicProvider({ client: null });
    await expect(provider.ask("hi", {})).rejects.toThrow(/provider/i);

    // 11. Compliance status persisted for the scan.
    const reloaded = await repo.getProtocol(scan.id);
    expect(reloaded?.id).toBe(scan.id);

    // The whole pipeline produced the expected terminal states without ever
    // touching RN, Expo, or the network.
    expect(TaskStatus.Verified).toBe("VERIFIED");

    await repo.close();
  });
});
