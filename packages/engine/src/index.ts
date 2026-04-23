export { sofiaRules } from "./rules/sofia";
export { evaluateTopographyCompliance } from "./compliance";

export { speciesCatalogue } from "./data/species";
export { matchSpeciesToSite } from "./species-matching";
export type { SpeciesMatch, MatchResult } from "./species-matching";

export { diagnosePin } from "./diagnosis";
export type { DiagnoseInput } from "./diagnosis";

export { familyMembers, familyOfSpecies } from "./rotation/families";
export { rotationRules } from "./rotation/rotation-rules";
export { companionTable } from "./rotation/companions";
export { adviseRotation } from "./rotation/advisor";
export type { AdviseRotationInput, AdviseRotationResult } from "./rotation/advisor";

export { speciesDemandTable, lookupDemand } from "./nutrient/species-demand";
export { computeLimitingFactor } from "./nutrient/liebig";
export type { LimitingFactor } from "./nutrient/liebig";
export { lookupKc, kcSourceCitation } from "./nutrient/kc-tables";
export { sofiaFallbackClimate, SOFIA_CLIMATOLOGY_CITATION } from "./nutrient/climate-fallback";
export { adviseAmendments, adviseWater } from "./nutrient/advisor";
export type { AdviseAmendmentsResult } from "./nutrient/advisor";

export {
  yieldBySectorAndYear,
  plantingsBySectorAndYear,
  heatmapData,
  yoyBySectorAndSpecies
} from "./aggregation/yield";
export type { HeatmapTile, YoyRow } from "./aggregation/yield";

export { createReasoningRouter } from "./reasoning/provider";
export type {
  ReasoningProvider,
  ReasoningRouter,
  ReasoningRouterInput
} from "./reasoning/provider";
export { anthropicProvider } from "./reasoning/anthropic-provider";
export type { AnthropicClientLike, AnthropicProviderInput } from "./reasoning/anthropic-provider";
