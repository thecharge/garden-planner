import { CompanionAffinity } from "@garden/config";
import type { CompanionEntry } from "@garden/config";

/** Companion-planting affinity table.
 *
 * Each entry has a mechanism (what the interaction does) and a sourceCitation
 * pointing to the literature. Negative entries are surfaced as warnings by the
 * advisor, never silent down-ranks.
 */
export const companionTable: ReadonlyArray<CompanionEntry> = [
  {
    speciesA: "tomato-san-marzano",
    speciesB: "bean-bush",
    affinity: CompanionAffinity.Positive,
    mechanism: "Beans fix nitrogen nearby; do not shade tomatoes.",
    sourceCitation: "Riotte, 'Carrots Love Tomatoes', chapter 3 (Solanaceae)."
  },
  {
    speciesA: "tomato-san-marzano",
    speciesB: "carrot-nantes",
    affinity: CompanionAffinity.Positive,
    mechanism: "Shallow carrot roots don't compete with deep tomato roots; long-standing pairing.",
    sourceCitation: "Riotte, 'Carrots Love Tomatoes' (titular pairing)."
  },
  {
    speciesA: "cabbage-savoy",
    speciesB: "garlic-softneck",
    affinity: CompanionAffinity.Positive,
    mechanism: "Allium compounds deter common cabbage pests (moth, aphid).",
    sourceCitation: "Cornell Cooperative Extension — companion planting primer."
  },
  {
    speciesA: "bean-bush",
    speciesB: "garlic-softneck",
    affinity: CompanionAffinity.Negative,
    mechanism: "Alliums reduce legume nodulation and nitrogen fixation.",
    sourceCitation:
      "Willey, 'Resource Use in Intercropping Systems', Experimental Agriculture (1990)."
  },
  {
    speciesA: "squash-zucchini",
    speciesB: "bean-bush",
    affinity: CompanionAffinity.Positive,
    mechanism: "Three-sisters style pairing — beans fix N, squash shades soil.",
    sourceCitation: "USDA SARE — three-sisters case studies."
  }
];
