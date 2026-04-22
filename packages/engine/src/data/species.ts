import { CropFamily, OrientationFit, SoilTexture } from "@garden/config";
import type { SpeciesRecord } from "@garden/config";

/** Starter species catalogue for Chepinci / Sofia basin.
 *
 * Placeholder entries — every entry carries a sourceCitation. A named agronomist
 * or extension service reviewer must confirm these before the first public
 * release (see the proposal's open questions). CI fails on missing citations.
 */
export const speciesCatalogue: ReadonlyArray<SpeciesRecord> = [
  {
    id: "tomato-san-marzano",
    commonName: "San Marzano tomato",
    latinName: "Solanum lycopersicum 'San Marzano'",
    family: CropFamily.Solanaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam, SoilTexture.Clay],
      slopeMaxDegrees: 10,
      waterTableMinDepthMeters: 1.0,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 6.8,
    notes: "Warm-season heavy feeder; stake or cage; water consistently to avoid blossom-end rot.",
    sourceCitation: "RHS / USDA NRCS vegetable guides; review pending."
  },
  {
    id: "pepper-sivria",
    commonName: "Sivria pepper",
    latinName: "Capsicum annuum 'Sivria'",
    family: CropFamily.Solanaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam, SoilTexture.Sandy],
      slopeMaxDegrees: 8,
      waterTableMinDepthMeters: 1.2,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 7.0,
    sourceCitation: "Bulgarian Agricultural Academy pepper cultivar notes (advisory)."
  },
  {
    id: "bean-bush",
    commonName: "Bush bean",
    latinName: "Phaseolus vulgaris",
    family: CropFamily.Fabaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam, SoilTexture.Sandy, SoilTexture.Clay],
      slopeMaxDegrees: 12,
      waterTableMinDepthMeters: 0.8,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 7.2,
    notes: "Nitrogen fixer — plant before heavy feeders in rotation.",
    sourceCitation: "USDA SARE rotation guide — Legume section."
  },
  {
    id: "cabbage-savoy",
    commonName: "Savoy cabbage",
    latinName: "Brassica oleracea var. sabauda",
    family: CropFamily.Brassicaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam, SoilTexture.Clay],
      slopeMaxDegrees: 10,
      waterTableMinDepthMeters: 1.0,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.5,
    phMax: 7.5,
    notes: "Heavy nitrogen feeder; benefits from a preceding legume.",
    sourceCitation: "Coleman, 'The New Organic Grower' (brassica chapter)."
  },
  {
    id: "squash-zucchini",
    commonName: "Zucchini",
    latinName: "Cucurbita pepo",
    family: CropFamily.Cucurbitaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam],
      slopeMaxDegrees: 8,
      waterTableMinDepthMeters: 1.2,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 7.0,
    sourceCitation: "RHS cucurbit guide — advisory."
  },
  {
    id: "carrot-nantes",
    commonName: "Nantes carrot",
    latinName: "Daucus carota 'Nantes'",
    family: CropFamily.Apiaceae,
    siteFit: {
      soilTypes: [SoilTexture.Sandy, SoilTexture.Loam],
      slopeMaxDegrees: 10,
      waterTableMinDepthMeters: 0.9,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 6.8,
    notes: "Avoid clay — roots fork. Stone-free, well-drained soil preferred.",
    sourceCitation: "RHS carrot guide — advisory."
  },
  {
    id: "garlic-softneck",
    commonName: "Softneck garlic",
    latinName: "Allium sativum",
    family: CropFamily.Alliaceae,
    siteFit: {
      soilTypes: [SoilTexture.Loam, SoilTexture.Sandy],
      slopeMaxDegrees: 10,
      waterTableMinDepthMeters: 1.0,
      orientationFit: OrientationFit.Sun
    },
    phMin: 6.0,
    phMax: 7.0,
    notes: "Plant in autumn; harvest in summer. Good after brassicas in rotation.",
    sourceCitation: "USDA SARE rotation guide — Allium section."
  },
  {
    id: "willow-goat",
    commonName: "Goat willow",
    latinName: "Salix caprea",
    family: CropFamily.Rosaceae,
    siteFit: {
      soilTypes: [SoilTexture.Clay, SoilTexture.Loam, SoilTexture.Silty, SoilTexture.Peaty],
      slopeMaxDegrees: 25,
      waterTableMinDepthMeters: 0.2,
      orientationFit: OrientationFit.Any
    },
    phMin: 5.5,
    phMax: 7.5,
    notes: "Deep-rooting, water-hungry — recommended for pooling-water sites to drain naturally.",
    sourceCitation: "European Forest Genetic Resources Programme — Salix section."
  }
];
