import { SmepErrors } from "@garden/config";
import type {
  Harvest,
  InventoryEvent,
  InventoryRecord,
  Protocol,
  Sector,
  SoilSample
} from "@garden/config";

const parseJson = <T>(raw: string | null | undefined): T | undefined => {
  if (raw === null || raw === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw SmepErrors.repositoryUnavailable();
  }
};

export type ScanRow = {
  id: string;
  captured_at: string;
  confidence: number;
  data_json: string;
};

export const rowToProtocol = (row: ScanRow): Protocol => {
  const data = parseJson<Protocol["data"]>(row.data_json);
  if (!data) {
    throw SmepErrors.repositoryUnavailable();
  }
  return {
    id: row.id,
    capturedAt: row.captured_at,
    confidence: row.confidence,
    data
  };
};

export type EventRow = {
  id: string;
  kind: string;
  captured_at: string;
  delta: number;
  target_record_id: string | null;
  pin_id: string | null;
  sector_id: string | null;
  species_id: string | null;
  pest_species_id: string | null;
  notes: string | null;
};

const pickDefined = <T>(value: T | null): T | undefined =>
  value === null ? undefined : value;

export const rowToEvent = (row: EventRow): InventoryEvent => ({
  id: row.id,
  kind: row.kind as InventoryEvent["kind"],
  capturedAt: row.captured_at,
  delta: row.delta,
  ...(pickDefined(row.target_record_id) === undefined ? {} : { targetRecordId: row.target_record_id as string }),
  ...(pickDefined(row.pin_id) === undefined ? {} : { pinId: row.pin_id as string }),
  ...(pickDefined(row.sector_id) === undefined ? {} : { sectorId: row.sector_id as string }),
  ...(pickDefined(row.species_id) === undefined ? {} : { speciesId: row.species_id as string }),
  ...(pickDefined(row.pest_species_id) === undefined ? {} : { pestSpeciesId: row.pest_species_id as string }),
  ...(pickDefined(row.notes) === undefined ? {} : { notes: row.notes as string })
});

export type SectorRow = {
  id: string;
  plot_id: string;
  name: string;
  polygon_json: string;
  created_at: string;
};

export const rowToSector = (row: SectorRow): Sector => {
  const polygon = parseJson<Sector["polygon"]>(row.polygon_json);
  if (!polygon) {
    throw SmepErrors.repositoryUnavailable();
  }
  return {
    id: row.id,
    plotId: row.plot_id,
    name: row.name,
    polygon,
    createdAt: row.created_at
  };
};

export type HarvestRow = {
  id: string;
  sector_id: string;
  species_id: string;
  weight_grams: number;
  harvested_at: string;
  notes: string | null;
};

export const rowToHarvest = (row: HarvestRow): Harvest => ({
  id: row.id,
  sectorId: row.sector_id,
  speciesId: row.species_id,
  weightGrams: row.weight_grams,
  harvestedAt: row.harvested_at,
  ...(row.notes === null ? {} : { notes: row.notes })
});

export type SoilRow = {
  id: string;
  sector_id: string | null;
  pin_id: string | null;
  captured_at: string;
  ph: number;
  texture: string;
  npk_json: string | null;
  micros_json: string | null;
  organic_matter_pct: number | null;
  ec: number | null;
};

export const rowToSoilSample = (row: SoilRow): SoilSample => {
  const npk = parseJson<SoilSample["npk"]>(row.npk_json);
  const micros = parseJson<SoilSample["micros"]>(row.micros_json);
  return {
    id: row.id,
    ...(row.sector_id === null ? {} : { sectorId: row.sector_id }),
    ...(row.pin_id === null ? {} : { pinId: row.pin_id }),
    capturedAt: row.captured_at,
    pH: row.ph,
    texture: row.texture as SoilSample["texture"],
    ...(npk === undefined ? {} : { npk }),
    ...(micros === undefined ? {} : { micros }),
    ...(row.organic_matter_pct === null ? {} : { organicMatterPct: row.organic_matter_pct }),
    ...(row.ec === null ? {} : { ec: row.ec })
  };
};

export type InventoryRow = {
  id: string;
  kind: string;
  name: string;
  quantity: number;
  unit: string;
  acquired_at: string;
  source_supplier_id: string | null;
  notes: string | null;
};

export const rowToInventoryRecord = (row: InventoryRow): InventoryRecord => ({
  id: row.id,
  kind: row.kind as InventoryRecord["kind"],
  name: row.name,
  quantity: row.quantity,
  unit: row.unit,
  acquiredAt: row.acquired_at,
  ...(row.source_supplier_id === null ? {} : { sourceSupplierId: row.source_supplier_id }),
  ...(row.notes === null ? {} : { notes: row.notes })
});
