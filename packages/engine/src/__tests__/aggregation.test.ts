import { SmepError } from "@garden/config";
import { createMemoryRepository } from "@garden/memory";
import {
  heatmapData,
  plantingsBySectorAndYear,
  yieldBySectorAndYear
} from "../aggregation/yield";

const sector = {
  id: "s-1",
  plotId: "plot-a",
  name: "North Bed",
  polygon: [
    { lat: 0, lon: 0 },
    { lat: 1, lon: 0 },
    { lat: 1, lon: 1 },
    { lat: 0, lon: 1 }
  ],
  createdAt: "2026-03-01T00:00:00.000Z"
};

describe("aggregators", () => {
  it("yieldBySectorAndYear sums grams by species and filters by year", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    await repo.appendHarvest({
      id: "h-1",
      sectorId: "s-1",
      speciesId: "tomato-san-marzano",
      weightGrams: 4200,
      harvestedAt: "2026-08-12T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "h-2",
      sectorId: "s-1",
      speciesId: "tomato-san-marzano",
      weightGrams: 1500,
      harvestedAt: "2026-09-01T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "h-3",
      sectorId: "s-1",
      speciesId: "tomato-san-marzano",
      weightGrams: 2000,
      harvestedAt: "2025-08-01T00:00:00.000Z"
    });
    const map2026 = await yieldBySectorAndYear(repo, "s-1", 2026);
    expect(map2026.get("tomato-san-marzano")).toBe(5700);
    const map2025 = await yieldBySectorAndYear(repo, "s-1", 2025);
    expect(map2025.get("tomato-san-marzano")).toBe(2000);
    await repo.close();
  });

  it("plantingsBySectorAndYear lists SOWED and TRANSPLANTED events only", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    await repo.appendEvent({
      id: "ev-1",
      kind: "SOWED",
      capturedAt: "2026-04-15T00:00:00.000Z",
      delta: -50,
      sectorId: "s-1",
      speciesId: "tomato-san-marzano"
    });
    await repo.appendEvent({
      id: "ev-2",
      kind: "PEST_OBSERVED",
      capturedAt: "2026-06-01T00:00:00.000Z",
      delta: 0,
      sectorId: "s-1"
    });
    const list = await plantingsBySectorAndYear(repo, "s-1", 2026);
    expect(list).toHaveLength(1);
    expect(list[0]?.speciesId).toBe("tomato-san-marzano");
    expect(list[0]?.quantity).toBe(50);
    await repo.close();
  });

  it("heatmapData covers every sector on a plot with its total", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    await repo.saveSector({ ...sector, id: "s-2", name: "South Bed" });
    await repo.appendHarvest({
      id: "h-1",
      sectorId: "s-1",
      speciesId: "tomato-san-marzano",
      weightGrams: 4200,
      harvestedAt: "2026-08-12T00:00:00.000Z"
    });
    const tiles = await heatmapData(repo, "plot-a", 2026);
    expect(tiles).toHaveLength(2);
    expect(tiles.find((t) => t.sectorId === "s-1")?.totalGrams).toBe(4200);
    expect(tiles.find((t) => t.sectorId === "s-2")?.totalGrams).toBe(0);
    await repo.close();
  });

  it("invalid harvest weight in the DB raises SmepError at aggregation time", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    await expect(
      repo.appendHarvest({
        id: "h-bad",
        sectorId: "s-1",
        speciesId: "tomato-san-marzano",
        weightGrams: 0,
        harvestedAt: "2026-08-01T00:00:00.000Z"
      })
    ).rejects.toBeInstanceOf(SmepError);
    await repo.close();
  });
});
