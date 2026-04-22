import type { MemoryRepository } from "@garden/memory";
import type {
  BoundaryPolygon,
  Harvest,
  InventoryEvent,
  InventoryRecord,
  PermitSpec,
  Protocol,
  Sector,
  SoilSample,
  TaskStatus
} from "@garden/config";

/** Pure-JS in-memory MemoryRepository for the device runtime.
 *
 * @garden/memory's Node path uses better-sqlite3 (native; references `fs`) and
 * therefore can't bundle into Metro. This adapter satisfies the same
 * MemoryRepository interface using plain Maps so the app renders today. A real
 * expo-sqlite adapter is a follow-up change (`make-device-sqlite-adapter`).
 */

type Store = {
  protocols: Map<string, Protocol>;
  scanStatus: Map<string, TaskStatus>;
  permits: PermitSpec[];
  inventoryRecords: Map<string, InventoryRecord>;
  events: InventoryEvent[];
  sectors: Map<string, Sector>;
  harvests: Harvest[];
  soilSamples: SoilSample[];
  boundaries: Map<string, BoundaryPolygon>;
};

const emptyStore = (): Store => ({
  protocols: new Map(),
  scanStatus: new Map(),
  permits: [],
  inventoryRecords: new Map(),
  events: [],
  sectors: new Map(),
  harvests: [],
  soilSamples: [],
  boundaries: new Map()
});

const createInMemoryRepository = (): MemoryRepository => {
  const s = emptyStore();
  return {
    saveProtocol: async (p) => {
      s.protocols.set(p.id, p);
    },
    getProtocol: async (id) => s.protocols.get(id),
    saveStatus: async (scanId, status) => {
      s.scanStatus.set(scanId, status);
    },
    savePermitSpec: async (spec) => {
      s.permits.push(spec);
    },
    saveInventoryRecord: async (r) => {
      s.inventoryRecords.set(r.id, r);
    },
    listInventoryRecords: async () =>
      Array.from(s.inventoryRecords.values()).sort((a, b) =>
        a.acquiredAt < b.acquiredAt ? 1 : -1
      ),
    appendEvent: async (e) => {
      s.events.push(e);
    },
    listEventsByPin: async (pinId) => s.events.filter((e) => e.pinId === pinId),
    listEventsBySector: async (sectorId) => s.events.filter((e) => e.sectorId === sectorId),
    listEventsInRange: async (fromIso, toIso) =>
      s.events.filter((e) => e.capturedAt >= fromIso && e.capturedAt <= toIso),
    saveSector: async (sector) => {
      s.sectors.set(sector.id, sector);
    },
    getSector: async (id) => s.sectors.get(id),
    listSectorsByPlot: async (plotId) =>
      Array.from(s.sectors.values()).filter((sec) => sec.plotId === plotId),
    renameSector: async (id, name) => {
      const existing = s.sectors.get(id);
      if (!existing) {
        return;
      }
      s.sectors.set(id, { ...existing, name });
    },
    deleteSector: async (id) => {
      s.sectors.delete(id);
    },
    appendHarvest: async (h) => {
      s.harvests.push(h);
    },
    listHarvestsBySector: async (sectorId) => s.harvests.filter((h) => h.sectorId === sectorId),
    saveSoilSample: async (sample) => {
      s.soilSamples.push(sample);
    },
    listSoilSamplesBySector: async (sectorId) =>
      s.soilSamples.filter((ss) => ss.sectorId === sectorId),
    listSoilSamplesByPin: async (pinId) => s.soilSamples.filter((ss) => ss.pinId === pinId),
    saveBoundary: async (b) => {
      s.boundaries.set(b.plotId, b);
    },
    getBoundary: async (plotId) => s.boundaries.get(plotId),
    close: async () => {}
  };
};

let instance: MemoryRepository | null = null;

export const getMemoryRepository = async (): Promise<MemoryRepository> => {
  if (instance) {
    return instance;
  }
  instance = createInMemoryRepository();
  return instance;
};

export const __resetMemoryRepositoryForTests = (): void => {
  instance = null;
};
