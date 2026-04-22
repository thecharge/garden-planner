import { SmepErrors } from "@garden/config";
import type { SqliteLike } from "./adapters/sqlite-like";
import { runMigrations } from "./migrations";
import type { MemoryRepository } from "./memory-repository";
import {
  rowToEvent,
  rowToHarvest,
  rowToInventoryRecord,
  rowToProtocol,
  rowToSector,
  rowToSoilSample
} from "./row-mappers";
import type {
  EventRow,
  HarvestRow,
  InventoryRow,
  ScanRow,
  SectorRow,
  SoilRow
} from "./row-mappers";
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

const BOUNDARY_TABLE = `
  CREATE TABLE IF NOT EXISTS boundaries (
    plot_id TEXT PRIMARY KEY,
    corners_json TEXT NOT NULL,
    captured_at TEXT NOT NULL
  );
`;

type BoundaryRow = {
  plot_id: string;
  corners_json: string;
  captured_at: string;
};

const asPositiveFinite = (value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw SmepErrors.invalidHarvestWeight(value);
  }
};

/** Build a MemoryRepository over any SqliteLike adapter. */
export const buildRepository = async (sqlite: SqliteLike): Promise<MemoryRepository> => {
  await runMigrations(sqlite);
  await sqlite.exec(BOUNDARY_TABLE);

  const repo: MemoryRepository = {
    saveProtocol: async (p: Protocol) => {
      await sqlite.run(
        `INSERT INTO scans (id, captured_at, confidence, data_json, status)
         VALUES (?, ?, ?, ?, 'IN_PROGRESS')
         ON CONFLICT(id) DO UPDATE SET
           captured_at = excluded.captured_at,
           confidence = excluded.confidence,
           data_json = excluded.data_json`,
        [p.id, p.capturedAt, p.confidence, JSON.stringify(p.data)]
      );
    },

    getProtocol: async (id: string) => {
      const row = await sqlite.get<ScanRow>("SELECT * FROM scans WHERE id = ?", [id]);
      return row ? rowToProtocol(row) : undefined;
    },

    saveStatus: async (scanId: string, status: TaskStatus) => {
      await sqlite.run("UPDATE scans SET status = ? WHERE id = ?", [status, scanId]);
    },

    savePermitSpec: async (spec: PermitSpec) => {
      await sqlite.run(
        `INSERT INTO permit_specs (id, scan_id, rule_id, generated_at, body)
         VALUES (?, ?, ?, ?, ?)`,
        [spec.id, spec.scanId, spec.ruleId, spec.generatedAt, spec.body]
      );
    },

    saveInventoryRecord: async (r: InventoryRecord) => {
      await sqlite.run(
        `INSERT INTO inventory_records
         (id, kind, name, quantity, unit, acquired_at, source_supplier_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           quantity = excluded.quantity,
           notes = excluded.notes`,
        [
          r.id,
          r.kind,
          r.name,
          r.quantity,
          r.unit,
          r.acquiredAt,
          r.sourceSupplierId ?? null,
          r.notes ?? null
        ]
      );
    },

    listInventoryRecords: async () => {
      const rows = await sqlite.all<InventoryRow>(
        "SELECT * FROM inventory_records ORDER BY acquired_at DESC"
      );
      return rows.map(rowToInventoryRecord);
    },

    appendEvent: async (e: InventoryEvent) => {
      await sqlite.run(
        `INSERT INTO inventory_events
         (id, kind, captured_at, delta, target_record_id, pin_id, sector_id, species_id, pest_species_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id,
          e.kind,
          e.capturedAt,
          e.delta,
          e.targetRecordId ?? null,
          e.pinId ?? null,
          e.sectorId ?? null,
          e.speciesId ?? null,
          e.pestSpeciesId ?? null,
          e.notes ?? null
        ]
      );
    },

    listEventsByPin: async (pinId: string) => {
      const rows = await sqlite.all<EventRow>(
        "SELECT * FROM inventory_events WHERE pin_id = ? ORDER BY captured_at ASC",
        [pinId]
      );
      return rows.map(rowToEvent);
    },

    listEventsBySector: async (sectorId: string) => {
      const rows = await sqlite.all<EventRow>(
        "SELECT * FROM inventory_events WHERE sector_id = ? ORDER BY captured_at ASC",
        [sectorId]
      );
      return rows.map(rowToEvent);
    },

    listEventsInRange: async (fromIso: string, toIso: string) => {
      const rows = await sqlite.all<EventRow>(
        "SELECT * FROM inventory_events WHERE captured_at BETWEEN ? AND ? ORDER BY captured_at ASC",
        [fromIso, toIso]
      );
      return rows.map(rowToEvent);
    },

    saveSector: async (s: Sector) => {
      await sqlite.run(
        `INSERT INTO sectors (id, plot_id, name, polygon_json, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           plot_id = excluded.plot_id,
           name = excluded.name,
           polygon_json = excluded.polygon_json`,
        [s.id, s.plotId, s.name, JSON.stringify(s.polygon), s.createdAt]
      );
    },

    getSector: async (id: string) => {
      const row = await sqlite.get<SectorRow>("SELECT * FROM sectors WHERE id = ?", [id]);
      return row ? rowToSector(row) : undefined;
    },

    listSectorsByPlot: async (plotId: string) => {
      const rows = await sqlite.all<SectorRow>(
        "SELECT * FROM sectors WHERE plot_id = ? ORDER BY created_at ASC",
        [plotId]
      );
      return rows.map(rowToSector);
    },

    renameSector: async (id: string, name: string) => {
      await sqlite.run("UPDATE sectors SET name = ? WHERE id = ?", [name, id]);
    },

    deleteSector: async (id: string) => {
      await sqlite.run("DELETE FROM sectors WHERE id = ?", [id]);
    },

    appendHarvest: async (h: Harvest) => {
      asPositiveFinite(h.weightGrams);
      await sqlite.run(
        `INSERT INTO harvests (id, sector_id, species_id, weight_grams, harvested_at, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [h.id, h.sectorId, h.speciesId, h.weightGrams, h.harvestedAt, h.notes ?? null]
      );
    },

    listHarvestsBySector: async (sectorId: string) => {
      const rows = await sqlite.all<HarvestRow>(
        "SELECT * FROM harvests WHERE sector_id = ? ORDER BY harvested_at ASC",
        [sectorId]
      );
      return rows.map(rowToHarvest);
    },

    saveSoilSample: async (s: SoilSample) => {
      await sqlite.run(
        `INSERT INTO soil_samples
         (id, sector_id, pin_id, captured_at, ph, texture, npk_json, micros_json, organic_matter_pct, ec)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.sectorId ?? null,
          s.pinId ?? null,
          s.capturedAt,
          s.pH,
          s.texture,
          s.npk ? JSON.stringify(s.npk) : null,
          s.micros ? JSON.stringify(s.micros) : null,
          s.organicMatterPct ?? null,
          s.ec ?? null
        ]
      );
    },

    listSoilSamplesBySector: async (sectorId: string) => {
      const rows = await sqlite.all<SoilRow>(
        "SELECT * FROM soil_samples WHERE sector_id = ? ORDER BY captured_at ASC",
        [sectorId]
      );
      return rows.map(rowToSoilSample);
    },

    listSoilSamplesByPin: async (pinId: string) => {
      const rows = await sqlite.all<SoilRow>(
        "SELECT * FROM soil_samples WHERE pin_id = ? ORDER BY captured_at ASC",
        [pinId]
      );
      return rows.map(rowToSoilSample);
    },

    saveBoundary: async (b: BoundaryPolygon) => {
      await sqlite.run(
        `INSERT INTO boundaries (plot_id, corners_json, captured_at)
         VALUES (?, ?, ?)
         ON CONFLICT(plot_id) DO UPDATE SET
           corners_json = excluded.corners_json,
           captured_at = excluded.captured_at`,
        [b.plotId, JSON.stringify(b.corners), b.capturedAt]
      );
    },

    getBoundary: async (plotId: string) => {
      const row = await sqlite.get<BoundaryRow>("SELECT * FROM boundaries WHERE plot_id = ?", [
        plotId
      ]);
      if (!row) {
        return undefined;
      }
      try {
        return {
          plotId: row.plot_id,
          corners: JSON.parse(row.corners_json) as BoundaryPolygon["corners"],
          capturedAt: row.captured_at
        };
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    },

    close: async () => {
      await sqlite.close();
    }
  };

  // Expose the listInventoryRecords helper used by feature hooks via a
  // separate function — keeps the interface concise while still testable.
  return repo;
};

/** Secondary helper kept off the narrow repo interface to avoid bloat. */
export const listInventoryRecords = async (
  sqlite: SqliteLike
): Promise<ReadonlyArray<InventoryRecord>> => {
  const rows = await sqlite.all<InventoryRow>(
    "SELECT * FROM inventory_records ORDER BY acquired_at DESC"
  );
  return rows.map(rowToInventoryRecord);
};
