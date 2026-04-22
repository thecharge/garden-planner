import type { GrowthStage } from "@garden/config";

/** FAO-56 Kc crop coefficients (single-crop approach).
 *
 * Source: Allen, Pereira, Raes & Smith (1998), "Crop evapotranspiration —
 * Guidelines for computing crop water requirements", FAO Irrigation and
 * Drainage Paper 56, Table 12. Values reflect mid-latitude estimates; local
 * calibration recommended but out-of-scope for MVP.
 */

type KcRow = Readonly<Record<GrowthStage, number>>;

const table: Readonly<Record<string, KcRow>> = {
  "tomato-san-marzano": { initial: 0.6, development: 0.85, "mid-season": 1.15, "late-season": 0.75 },
  "pepper-sivria": { initial: 0.6, development: 0.9, "mid-season": 1.05, "late-season": 0.9 },
  "bean-bush": { initial: 0.5, development: 0.8, "mid-season": 1.05, "late-season": 0.85 },
  "cabbage-savoy": { initial: 0.7, development: 0.9, "mid-season": 1.05, "late-season": 0.95 },
  "squash-zucchini": { initial: 0.5, development: 0.8, "mid-season": 1.0, "late-season": 0.8 },
  "carrot-nantes": { initial: 0.7, development: 0.9, "mid-season": 1.05, "late-season": 0.95 },
  "garlic-softneck": { initial: 0.7, development: 0.9, "mid-season": 1.0, "late-season": 0.7 },
  "willow-goat": { initial: 0.9, development: 1.0, "mid-season": 1.2, "late-season": 1.0 }
};

export const lookupKc = (speciesId: string, stage: GrowthStage): number | undefined =>
  table[speciesId]?.[stage];

export const kcSourceCitation =
  "FAO-56 Irrigation & Drainage Paper, Allen et al. 1998, Table 12.";
