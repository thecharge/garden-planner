import type { CropFamily } from "../enums";

export const RotationReasonCode = {
  SameFamilyTooSoon: "SAME_FAMILY_TOO_SOON",
  LegumeNitrogenCarryover: "LEGUME_NITROGEN_CARRYOVER",
  CompanionPositive: "COMPANION_POSITIVE",
  CompanionNegative: "COMPANION_NEGATIVE",
  AlliumAfterBrassica: "ALLIUM_AFTER_BRASSICA",
  FallowRecommended: "FALLOW_RECOMMENDED",
  GeneralFit: "GENERAL_FIT"
} as const;
export type RotationReasonCode = (typeof RotationReasonCode)[keyof typeof RotationReasonCode];

export const CompanionAffinity = {
  Positive: "POSITIVE",
  Negative: "NEGATIVE",
  Neutral: "NEUTRAL"
} as const;
export type CompanionAffinity = (typeof CompanionAffinity)[keyof typeof CompanionAffinity];

export type RotationReason = {
  readonly code: RotationReasonCode;
  readonly message: string;
  readonly sourceCitation: string;
};

export type RotationRecommendation = {
  readonly speciesId: string;
  readonly score: number;
  readonly reasons: ReadonlyArray<RotationReason>;
};

export type CompanionEntry = {
  readonly speciesA: string;
  readonly speciesB: string;
  readonly affinity: CompanionAffinity;
  readonly mechanism: string;
  readonly sourceCitation: string;
};

export type RotationRule = {
  readonly id: string;
  readonly description: string;
  readonly sourceCitation: string;
  readonly apply: (context: {
    readonly sectorHistory: ReadonlyArray<{ family: CropFamily; year: number }>;
    readonly candidateFamily: CropFamily;
    readonly neighbourFamilies: ReadonlyArray<CropFamily>;
    readonly currentYear: number;
  }) => { scoreDelta: number; reason: RotationReason | null };
};
