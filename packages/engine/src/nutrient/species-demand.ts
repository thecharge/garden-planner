import type { SpeciesDemand } from "@garden/config";

/** Per-species nutrient demand.
 *
 * Values in NPK are advisory annual targets (kg/ha equivalent) derived from
 * extension-service bulletins. A reviewer (agronomist) must confirm before a
 * public release. CI fails on missing sourceCitation.
 */
export const speciesDemandTable: ReadonlyArray<SpeciesDemand> = [
  {
    speciesId: "tomato-san-marzano",
    targetNpk: { n: 150, p: 80, k: 220 },
    targetPhRange: [6.0, 6.8],
    sourceCitation:
      "Hochmuth, 'Fertilizer Recommendations for Tomato in Florida' (UF/IFAS) — values adapted."
  },
  {
    speciesId: "pepper-sivria",
    targetNpk: { n: 140, p: 70, k: 180 },
    targetPhRange: [6.0, 7.0],
    sourceCitation: "UF/IFAS pepper fertilization guide (advisory)."
  },
  {
    speciesId: "bean-bush",
    targetNpk: { n: 20, p: 50, k: 90 },
    targetPhRange: [6.0, 7.2],
    sourceCitation: "USDA SARE legume chapter — low-N target reflects N-fixing."
  },
  {
    speciesId: "cabbage-savoy",
    targetNpk: { n: 180, p: 90, k: 220 },
    targetPhRange: [6.5, 7.5],
    sourceCitation: "UF/IFAS cabbage fertilization guide."
  },
  {
    speciesId: "squash-zucchini",
    targetNpk: { n: 120, p: 60, k: 180 },
    targetPhRange: [6.0, 7.0],
    sourceCitation: "UF/IFAS cucurbit fertilization guide."
  },
  {
    speciesId: "carrot-nantes",
    targetNpk: { n: 90, p: 70, k: 200 },
    targetPhRange: [6.0, 6.8],
    sourceCitation: "RHS carrot cultivation notes (advisory)."
  },
  {
    speciesId: "garlic-softneck",
    targetNpk: { n: 110, p: 70, k: 180 },
    targetPhRange: [6.0, 7.0],
    sourceCitation: "USDA SARE allium chapter."
  },
  {
    speciesId: "willow-goat",
    targetNpk: { n: 80, p: 40, k: 100 },
    targetPhRange: [5.5, 7.5],
    sourceCitation: "European Forest Genetic Resources Programme — Salix section."
  }
];

export const lookupDemand = (speciesId: string): SpeciesDemand | undefined =>
  speciesDemandTable.find((d) => d.speciesId === speciesId);
