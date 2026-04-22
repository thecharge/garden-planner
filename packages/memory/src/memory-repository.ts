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

/** The one interface every consumer codes against.
 *
 * Every failure path throws SmepErrors.repositoryUnavailable — never a bare Error.
 * The expo-sqlite device adapter and the better-sqlite3 Node adapter both satisfy
 * this interface with identical semantics.
 */
export type MemoryRepository = {
  // --- Scans (Protocols) ---
  saveProtocol: (protocol: Protocol) => Promise<void>;
  getProtocol: (id: string) => Promise<Protocol | undefined>;
  saveStatus: (scanId: string, status: TaskStatus) => Promise<void>;

  // --- Permits ---
  savePermitSpec: (spec: PermitSpec) => Promise<void>;

  // --- Inventory + events (append-only) ---
  saveInventoryRecord: (record: InventoryRecord) => Promise<void>;
  listInventoryRecords: () => Promise<ReadonlyArray<InventoryRecord>>;
  appendEvent: (event: InventoryEvent) => Promise<void>;
  listEventsByPin: (pinId: string) => Promise<ReadonlyArray<InventoryEvent>>;
  listEventsBySector: (sectorId: string) => Promise<ReadonlyArray<InventoryEvent>>;
  listEventsInRange: (fromIso: string, toIso: string) => Promise<ReadonlyArray<InventoryEvent>>;

  // --- Sectors ---
  saveSector: (sector: Sector) => Promise<void>;
  getSector: (id: string) => Promise<Sector | undefined>;
  listSectorsByPlot: (plotId: string) => Promise<ReadonlyArray<Sector>>;
  renameSector: (id: string, name: string) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;

  // --- Harvests (append-only) ---
  appendHarvest: (harvest: Harvest) => Promise<void>;
  listHarvestsBySector: (sectorId: string) => Promise<ReadonlyArray<Harvest>>;

  // --- Soil samples ---
  saveSoilSample: (sample: SoilSample) => Promise<void>;
  listSoilSamplesBySector: (sectorId: string) => Promise<ReadonlyArray<SoilSample>>;
  listSoilSamplesByPin: (pinId: string) => Promise<ReadonlyArray<SoilSample>>;

  // --- Boundary polygon (per plot) ---
  saveBoundary: (boundary: BoundaryPolygon) => Promise<void>;
  getBoundary: (plotId: string) => Promise<BoundaryPolygon | undefined>;

  // --- Lifecycle ---
  close: () => Promise<void>;
};
