import type { EventKind } from "../enums";

export const InventoryKind = {
  Seed: "SEED",
  Plant: "PLANT",
  Tool: "TOOL",
  Amendment: "AMENDMENT"
} as const;
export type InventoryKind = (typeof InventoryKind)[keyof typeof InventoryKind];

export type InventoryRecord = {
  readonly id: string;
  readonly kind: InventoryKind;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly acquiredAt: string;
  readonly sourceSupplierId?: string;
  readonly notes?: string;
};

/** Append-only audit event. Corrections are expressed as new Correction events, not mutations. */
export type InventoryEvent = {
  readonly id: string;
  readonly kind: EventKind;
  readonly capturedAt: string;
  readonly delta: number;
  readonly targetRecordId?: string;
  readonly pinId?: string;
  readonly sectorId?: string;
  readonly speciesId?: string;
  readonly pestSpeciesId?: string;
  readonly notes?: string;
};
