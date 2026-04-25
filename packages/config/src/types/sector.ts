import type { SoilTexture } from "../enums";

export type GeoPoint = {
  readonly lat: number;
  readonly lon: number;
};

export type Sector = {
  readonly id: string;
  readonly plotId: string;
  readonly name: string;
  readonly polygon: ReadonlyArray<GeoPoint>;
  readonly createdAt: string;
  readonly slopeDegree?: number;
  readonly orientationDegrees?: number;
};

export type Harvest = {
  readonly id: string;
  readonly sectorId: string;
  readonly speciesId: string;
  readonly weightGrams: number;
  readonly harvestedAt: string;
  readonly notes?: string;
};

export type SoilSample = {
  readonly id: string;
  readonly sectorId?: string;
  readonly pinId?: string;
  readonly capturedAt: string;
  readonly pH: number;
  readonly texture: SoilTexture;
  readonly npk?: {
    readonly n: number;
    readonly p: number;
    readonly k: number;
  };
  readonly micros?: Readonly<Record<string, number>>;
  readonly organicMatterPct?: number;
  readonly ec?: number;
};
