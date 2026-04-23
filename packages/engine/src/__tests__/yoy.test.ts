import { createMemoryRepository } from "@garden/memory";
import { yoyBySectorAndSpecies } from "../aggregation/yield";

const seedSector = async (repo: Awaited<ReturnType<typeof createMemoryRepository>>, id: string) => {
  await repo.saveSector({
    id,
    plotId: "plot-a",
    name: `Bed ${id}`,
    polygon: [
      { lat: 0, lon: 0 },
      { lat: 1, lon: 0 },
      { lat: 1, lon: 1 },
      { lat: 0, lon: 1 }
    ],
    createdAt: "2026-03-01T00:00:00.000Z"
  });
};

describe("yoyBySectorAndSpecies", () => {
  it("happy: both years present yields a signed deltaGrams + deltaPct", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await seedSector(repo, "s-1");
    await repo.appendHarvest({
      id: "h-1",
      sectorId: "s-1",
      speciesId: "tomato-detvan",
      weightGrams: 2000,
      harvestedAt: "2025-08-10T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "h-2",
      sectorId: "s-1",
      speciesId: "tomato-detvan",
      weightGrams: 3500,
      harvestedAt: "2026-08-10T00:00:00.000Z"
    });
    const rows = await yoyBySectorAndSpecies(repo, "plot-a", 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      sectorId: "s-1",
      speciesId: "tomato-detvan",
      currentGrams: 3500,
      priorGrams: 2000,
      deltaGrams: 1500,
      deltaPct: 75
    });
    await repo.close();
  });

  it("side: new-this-year row reports priorGrams: 0 and deltaPct: null", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await seedSector(repo, "s-2");
    await repo.appendHarvest({
      id: "h-new",
      sectorId: "s-2",
      speciesId: "basil-genovese",
      weightGrams: 1000,
      harvestedAt: "2026-06-01T00:00:00.000Z"
    });
    const rows = await yoyBySectorAndSpecies(repo, "plot-a", 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.priorGrams).toBe(0);
    expect(rows[0]?.currentGrams).toBe(1000);
    expect(rows[0]?.deltaGrams).toBe(1000);
    expect(rows[0]?.deltaPct).toBeNull();
    await repo.close();
  });

  it("side: gone-this-year row reports currentGrams: 0 and negative delta", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await seedSector(repo, "s-3");
    await repo.appendHarvest({
      id: "h-old",
      sectorId: "s-3",
      speciesId: "carrot-nantes",
      weightGrams: 800,
      harvestedAt: "2025-07-01T00:00:00.000Z"
    });
    const rows = await yoyBySectorAndSpecies(repo, "plot-a", 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.currentGrams).toBe(0);
    expect(rows[0]?.priorGrams).toBe(800);
    expect(rows[0]?.deltaGrams).toBe(-800);
    expect(rows[0]?.deltaPct).toBe(-100);
    await repo.close();
  });

  it("critical: zero delta is still emitted (kept for audit)", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await seedSector(repo, "s-4");
    await repo.appendHarvest({
      id: "h-prev",
      sectorId: "s-4",
      speciesId: "onion-red",
      weightGrams: 500,
      harvestedAt: "2025-09-01T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "h-curr",
      sectorId: "s-4",
      speciesId: "onion-red",
      weightGrams: 500,
      harvestedAt: "2026-09-01T00:00:00.000Z"
    });
    const rows = await yoyBySectorAndSpecies(repo, "plot-a", 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.deltaGrams).toBe(0);
    expect(rows[0]?.deltaPct).toBe(0);
    await repo.close();
  });

  it("sorts by abs(delta) descending — biggest swings first", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await seedSector(repo, "s-5");
    await seedSector(repo, "s-6");
    await repo.appendHarvest({
      id: "a-prev",
      sectorId: "s-5",
      speciesId: "kale",
      weightGrams: 100,
      harvestedAt: "2025-07-01T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "a-curr",
      sectorId: "s-5",
      speciesId: "kale",
      weightGrams: 150,
      harvestedAt: "2026-07-01T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "b-prev",
      sectorId: "s-6",
      speciesId: "pepper",
      weightGrams: 1000,
      harvestedAt: "2025-08-01T00:00:00.000Z"
    });
    await repo.appendHarvest({
      id: "b-curr",
      sectorId: "s-6",
      speciesId: "pepper",
      weightGrams: 3000,
      harvestedAt: "2026-08-01T00:00:00.000Z"
    });
    const rows = await yoyBySectorAndSpecies(repo, "plot-a", 2026);
    expect(rows[0]?.speciesId).toBe("pepper");
    expect(rows[0]?.deltaGrams).toBe(2000);
    expect(rows[1]?.speciesId).toBe("kale");
    expect(rows[1]?.deltaGrams).toBe(50);
    await repo.close();
  });
});
