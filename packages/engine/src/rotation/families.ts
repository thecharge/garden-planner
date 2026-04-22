import { CropFamily } from "@garden/config";
import { speciesCatalogue } from "../data/species";
import type { SpeciesRecord } from "@garden/config";

/** Map from CropFamily → the catalogue's members of that family. Derived from
 * the species data file — adding a species with a family automatically makes
 * it a member here.
 */
export const familyMembers: Readonly<Record<CropFamily, ReadonlyArray<SpeciesRecord>>> = (() => {
  const init: Record<CropFamily, SpeciesRecord[]> = {
    [CropFamily.Solanaceae]: [],
    [CropFamily.Brassicaceae]: [],
    [CropFamily.Fabaceae]: [],
    [CropFamily.Cucurbitaceae]: [],
    [CropFamily.Apiaceae]: [],
    [CropFamily.Poaceae]: [],
    [CropFamily.Alliaceae]: [],
    [CropFamily.Asteraceae]: [],
    [CropFamily.Rosaceae]: []
  };
  for (const species of speciesCatalogue) {
    init[species.family].push(species);
  }
  return init;
})();

export const familyOfSpecies = (
  speciesId: string,
  catalogue: ReadonlyArray<SpeciesRecord> = speciesCatalogue
): CropFamily | undefined => catalogue.find((s) => s.id === speciesId)?.family;
