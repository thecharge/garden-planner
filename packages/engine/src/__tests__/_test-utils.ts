import type { MemoryRepository } from "@garden/memory";
import type { Protocol, ScanData } from "@garden/config";

export const createMockMemoryRepo = (): MemoryRepository & {
  readonly savedStatus: ReadonlyArray<{ id: string; status: string }>;
  readonly savedPermits: ReadonlyArray<string>;
} => {
  const statuses: { id: string; status: string }[] = [];
  const permits: string[] = [];
  const asyncNoop = async (): Promise<void> => {};

  return {
    saveProtocol: asyncNoop,
    getProtocol: async () => undefined,
    saveStatus: async (id, status) => {
      statuses.push({ id, status });
    },
    savePermitSpec: async (spec) => {
      permits.push(spec.ruleId);
    },
    saveInventoryRecord: asyncNoop,
    appendEvent: asyncNoop,
    listEventsByPin: async () => [],
    listEventsBySector: async () => [],
    listEventsInRange: async () => [],
    saveSector: asyncNoop,
    getSector: async () => undefined,
    listSectorsByPlot: async () => [],
    appendHarvest: asyncNoop,
    listHarvestsBySector: async () => [],
    saveSoilSample: asyncNoop,
    listSoilSamplesBySector: async () => [],
    listSoilSamplesByPin: async () => [],
    saveBoundary: asyncNoop,
    getBoundary: async () => undefined,
    close: asyncNoop,
    get savedStatus() {
      return statuses;
    },
    get savedPermits() {
      return permits;
    }
  } as MemoryRepository & {
    readonly savedStatus: ReadonlyArray<{ id: string; status: string }>;
    readonly savedPermits: ReadonlyArray<string>;
  };
};

export const createProtocol = (overrides: Partial<ScanData> = {}): Protocol => ({
  id: "scan-test",
  capturedAt: "2026-04-22T10:00:00.000Z",
  confidence: 0.9,
  data: {
    distanceToPropertyLine: 5,
    slopeDegree: 5,
    waterTableDepth: 10,
    ...overrides
  }
});
