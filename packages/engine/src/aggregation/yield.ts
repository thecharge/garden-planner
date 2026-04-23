import { SmepErrors } from "@garden/config";
import type { MemoryRepository } from "@garden/memory";
import type { Harvest } from "@garden/config";

const yearOfIso = (iso: string): number => {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  if (Number.isNaN(y)) {
    throw SmepErrors.invalidHarvestWeight(iso);
  }
  return y;
};

/** Yield aggregation by species for a sector and calendar year. */
export const yieldBySectorAndYear = async (
  repo: MemoryRepository,
  sectorId: string,
  year: number
): Promise<ReadonlyMap<string, number>> => {
  const harvests = await repo.listHarvestsBySector(sectorId);
  const out = new Map<string, number>();
  for (const h of harvests) {
    if (yearOfIso(h.harvestedAt) !== year) {
      continue;
    }
    if (!Number.isFinite(h.weightGrams) || h.weightGrams <= 0) {
      throw SmepErrors.invalidHarvestWeight(h.weightGrams);
    }
    out.set(h.speciesId, (out.get(h.speciesId) ?? 0) + h.weightGrams);
  }
  return out;
};

/** Plantings per sector per year — the "what did I plant here" query. */
export const plantingsBySectorAndYear = async (
  repo: MemoryRepository,
  sectorId: string,
  year: number
): Promise<ReadonlyArray<{ speciesId: string; quantity: number; sowedAt: string }>> => {
  const events = await repo.listEventsBySector(sectorId);
  const out: { speciesId: string; quantity: number; sowedAt: string }[] = [];
  for (const e of events) {
    if (e.kind !== "SOWED" && e.kind !== "TRANSPLANTED") {
      continue;
    }
    if (yearOfIso(e.capturedAt) !== year) {
      continue;
    }
    if (!e.speciesId) {
      continue;
    }
    out.push({ speciesId: e.speciesId, quantity: Math.abs(e.delta), sowedAt: e.capturedAt });
  }
  return out;
};

export type HeatmapTile = {
  readonly sectorId: string;
  readonly year: number;
  readonly totalGrams: number;
};

/** Heatmap data — one row per sector/year with total grams harvested. */
export const heatmapData = async (
  repo: MemoryRepository,
  plotId: string,
  year: number
): Promise<ReadonlyArray<HeatmapTile>> => {
  const sectors = await repo.listSectorsByPlot(plotId);
  const tiles: HeatmapTile[] = [];
  for (const s of sectors) {
    const yieldMap = await yieldBySectorAndYear(repo, s.id, year);
    let total = 0;
    for (const weight of yieldMap.values()) {
      total += weight;
    }
    tiles.push({ sectorId: s.id, year, totalGrams: total });
  }
  return tiles;
};

export type YoyRow = {
  readonly sectorId: string;
  readonly speciesId: string;
  readonly currentGrams: number;
  readonly priorGrams: number;
  readonly deltaGrams: number;
  readonly deltaPct: number | null;
};

/** Year-over-year yield: for every sector × species with a harvest in either
 * year, emit the current and prior gram totals + the signed delta. Sorted by
 * abs(deltaGrams) descending so the biggest swings surface first.
 */
export const yoyBySectorAndSpecies = async (
  repo: MemoryRepository,
  plotId: string,
  year: number
): Promise<ReadonlyArray<YoyRow>> => {
  const sectors = await repo.listSectorsByPlot(plotId);
  const rows: YoyRow[] = [];
  for (const s of sectors) {
    const current = await yieldBySectorAndYear(repo, s.id, year);
    const prior = await yieldBySectorAndYear(repo, s.id, year - 1);
    const species = new Set<string>();
    for (const k of current.keys()) {
      species.add(k);
    }
    for (const k of prior.keys()) {
      species.add(k);
    }
    for (const speciesId of species) {
      const currentGrams = current.get(speciesId) ?? 0;
      const priorGrams = prior.get(speciesId) ?? 0;
      const deltaGrams = currentGrams - priorGrams;
      const deltaPct = priorGrams > 0 ? Math.round((deltaGrams / priorGrams) * 100) : null;
      rows.push({ sectorId: s.id, speciesId, currentGrams, priorGrams, deltaGrams, deltaPct });
    }
  }
  rows.sort((a, b) => Math.abs(b.deltaGrams) - Math.abs(a.deltaGrams));
  return rows;
};

// keep `Harvest` importable from the aggregation barrel for consumers
export type { Harvest };
