import { EventKind } from "@garden/config";
import type { Harvest, Sector, SoilSample } from "@garden/config";
import { createMemoryRepository } from "../factory";

const sector: Sector = {
  id: "north-bed",
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

const harvest: Harvest = {
  id: "h-1",
  sectorId: "north-bed",
  speciesId: "tomato-san-marzano",
  weightGrams: 4200,
  harvestedAt: "2026-08-12T10:00:00.000Z"
};

describe("Sector / harvest / soil-sample round-trip", () => {
  it("persists a sector and retrieves it by id and by plot", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    expect(await repo.getSector("north-bed")).toEqual(sector);
    const list = await repo.listSectorsByPlot("plot-a");
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe("North Bed");
    await repo.close();
  });

  it("append-only harvest list is ordered by harvestedAt ascending", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSector(sector);
    await repo.appendHarvest({ ...harvest, id: "h-2", weightGrams: 3000, harvestedAt: "2026-07-01T00:00:00.000Z" });
    await repo.appendHarvest(harvest);
    const list = await repo.listHarvestsBySector("north-bed");
    expect(list).toHaveLength(2);
    expect(list[0]?.id).toBe("h-2");
    expect(list[1]?.id).toBe("h-1");
    await repo.close();
  });

  const soilCases: ReadonlyArray<
    readonly [name: string, sample: SoilSample, retrieveBy: "sector" | "pin"]
  > = [
    [
      "soil sample linked to sector",
      {
        id: "soil-1",
        sectorId: "north-bed",
        capturedAt: "2026-02-20T00:00:00.000Z",
        pH: 6.4,
        texture: "clay"
      },
      "sector"
    ],
    [
      "soil sample linked to pin",
      {
        id: "soil-2",
        pinId: "pin-xyz",
        capturedAt: "2026-02-21T00:00:00.000Z",
        pH: 6.9,
        texture: "loam"
      },
      "pin"
    ]
  ];

  it.each(soilCases)("%s is retrievable by its linkage", async (_n, sample, by) => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.saveSoilSample(sample);
    const found =
      by === "sector"
        ? await repo.listSoilSamplesBySector(sample.sectorId ?? "")
        : await repo.listSoilSamplesByPin(sample.pinId ?? "");
    expect(found).toHaveLength(1);
    expect(found[0]?.id).toBe(sample.id);
    await repo.close();
  });

  it("events listable by pin, sector, and time range", async () => {
    const repo = await createMemoryRepository({ mode: "in-memory" });
    await repo.appendEvent({
      id: "ev-1",
      kind: EventKind.PestObserved,
      capturedAt: "2026-07-15T08:00:00.000Z",
      delta: 0,
      pinId: "bed-3",
      pestSpeciesId: "aphid"
    });
    await repo.appendEvent({
      id: "ev-2",
      kind: EventKind.Sowed,
      capturedAt: "2026-04-01T08:00:00.000Z",
      delta: -20,
      sectorId: "north-bed",
      speciesId: "tomato-san-marzano"
    });
    expect(await repo.listEventsByPin("bed-3")).toHaveLength(1);
    expect(await repo.listEventsBySector("north-bed")).toHaveLength(1);
    const all2026 = await repo.listEventsInRange("2026-01-01T00:00:00.000Z", "2026-12-31T23:59:59.999Z");
    expect(all2026).toHaveLength(2);
    await repo.close();
  });
});
