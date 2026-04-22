import type { CropFamily, OrientationFit, SoilTexture } from "../enums";

export type SiteFit = {
  readonly soilTypes: ReadonlyArray<SoilTexture>;
  readonly slopeMaxDegrees: number;
  readonly waterTableMinDepthMeters: number;
  readonly orientationFit: OrientationFit;
};

export type SpeciesRecord = {
  readonly id: string;
  readonly commonName: string;
  readonly latinName: string;
  readonly family: CropFamily;
  readonly siteFit: SiteFit;
  readonly phMin: number;
  readonly phMax: number;
  readonly notes?: string;
  readonly sourceCitation: string;
};
