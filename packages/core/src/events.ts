import { EventKind } from "@garden/config";
import type { InventoryEvent } from "@garden/config";

export type EventFactoryInput = {
  readonly id: string;
  readonly capturedAt: string;
  readonly delta: number;
  readonly targetRecordId?: string;
  readonly pinId?: string;
  readonly sectorId?: string;
  readonly speciesId?: string;
  readonly pestSpeciesId?: string;
  readonly notes?: string;
};

const buildEvent = (kind: EventKind, input: EventFactoryInput): InventoryEvent => ({
  id: input.id,
  kind,
  capturedAt: input.capturedAt,
  delta: input.delta,
  ...(input.targetRecordId === undefined ? {} : { targetRecordId: input.targetRecordId }),
  ...(input.pinId === undefined ? {} : { pinId: input.pinId }),
  ...(input.sectorId === undefined ? {} : { sectorId: input.sectorId }),
  ...(input.speciesId === undefined ? {} : { speciesId: input.speciesId }),
  ...(input.pestSpeciesId === undefined ? {} : { pestSpeciesId: input.pestSpeciesId }),
  ...(input.notes === undefined ? {} : { notes: input.notes })
});

export const createAcquireEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.Acquired, input);

export const createSowEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.Sowed, input);

export const createTransplantEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.Transplanted, input);

export const createHarvestEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.Harvested, input);

export const createPestEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.PestObserved, input);

export const createSoilSampleEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.SoilSample, input);

export const createCorrectionEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.Correction, input);

export const createPlantFailureEvent = (input: EventFactoryInput): InventoryEvent =>
  buildEvent(EventKind.PlantFailure, input);
