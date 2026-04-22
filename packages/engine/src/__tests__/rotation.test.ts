import { CropFamily } from "@garden/config";
import { adviseRotation } from "../rotation/advisor";
import { speciesCatalogue } from "../data/species";

describe("adviseRotation", () => {
  it("penalises same-family-too-soon", () => {
    const result = adviseRotation({
      sectorHistory: [{ family: CropFamily.Solanaceae, year: 2025 }],
      neighbourCurrentCrops: [],
      availableSpecies: speciesCatalogue,
      currentYear: 2026
    });
    const tomato = result.recommendations.find((r) => r.speciesId === "tomato-san-marzano");
    const cabbage = result.recommendations.find((r) => r.speciesId === "cabbage-savoy");
    expect(tomato).toBeDefined();
    expect(cabbage).toBeDefined();
    expect(tomato!.score).toBeLessThan(cabbage!.score);
    expect(tomato!.reasons.some((r) => r.code === "SAME_FAMILY_TOO_SOON")).toBe(true);
  });

  it("boosts heavy feeders after a legume", () => {
    const result = adviseRotation({
      sectorHistory: [{ family: CropFamily.Fabaceae, year: 2025 }],
      neighbourCurrentCrops: [],
      availableSpecies: speciesCatalogue,
      currentYear: 2026
    });
    const cabbage = result.recommendations.find((r) => r.speciesId === "cabbage-savoy");
    expect(cabbage?.reasons.some((r) => r.code === "LEGUME_NITROGEN_CARRYOVER")).toBe(true);
  });

  it("surfaces negative companion pairings as warnings", () => {
    const result = adviseRotation({
      sectorHistory: [],
      neighbourCurrentCrops: ["garlic-softneck"],
      availableSpecies: speciesCatalogue,
      currentYear: 2026
    });
    const bean = result.recommendations.find((r) => r.speciesId === "bean-bush");
    expect(bean?.reasons.some((r) => r.code === "COMPANION_NEGATIVE")).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("empty history produces a warning about improving with data", () => {
    const result = adviseRotation({
      sectorHistory: [],
      neighbourCurrentCrops: [],
      availableSpecies: speciesCatalogue,
      currentYear: 2026
    });
    expect(result.warnings.some((w) => w.message.includes("history"))).toBe(true);
  });

  it("every reason carries a sourceCitation", () => {
    const result = adviseRotation({
      sectorHistory: [{ family: CropFamily.Fabaceae, year: 2025 }],
      neighbourCurrentCrops: ["tomato-san-marzano"],
      availableSpecies: speciesCatalogue,
      currentYear: 2026
    });
    for (const rec of result.recommendations) {
      for (const reason of rec.reasons) {
        expect(reason.sourceCitation.length).toBeGreaterThan(0);
      }
    }
  });
});
