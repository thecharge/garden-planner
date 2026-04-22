import type { TranslationKeys } from "./en";

/** Bulgarian mirror of the EN source.
 *
 * Every string currently equals its English counterpart and carries a
 * `// TODO(bg): native translation needed` marker. The app still functions
 * under a BG locale (it just shows English) until a named native translator
 * signs off the rows in `ACCESSIBILITY.md`. That's better than shipping
 * machine-translated strings that may read as nonsense to a dyslexic user.
 */
export const bg: TranslationKeys = {
  common: {
    // TODO(bg): native translation needed
    loading: "Loading…",
    // TODO(bg): native translation needed
    readyToScan: "Ready to scan.",
    // TODO(bg): native translation needed
    scanning: "Scanning…"
  },
  capture: {
    // TODO(bg): native translation needed
    title: "Scan the slope",
    // TODO(bg): native translation needed
    startCapture: "Start capture"
  },
  sectors: {
    // TODO(bg): native translation needed
    title: "Sectors",
    // TODO(bg): native translation needed
    countOne: "{{count}} sector",
    // TODO(bg): native translation needed
    countOther: "{{count}} sectors"
  },
  yield: {
    // TODO(bg): native translation needed
    title: "Year-over-year yield",
    // TODO(bg): native translation needed
    countOne: "{{count}} sector",
    // TODO(bg): native translation needed
    countOther: "{{count}} sectors"
  },
  rotation: {
    // TODO(bg): native translation needed
    title: "Rotation recommendations",
    // TODO(bg): native translation needed
    countOne: "{{count}} recommendation",
    // TODO(bg): native translation needed
    countOther: "{{count}} recommendations"
  },
  nutrient: {
    // TODO(bg): native translation needed
    title: "Amendments and irrigation",
    // TODO(bg): native translation needed
    mmPerWeek: "{{mm}} mm / week"
  },
  inventory: {
    // TODO(bg): native translation needed
    title: "Inventory",
    // TODO(bg): native translation needed
    countOne: "{{count}} item",
    // TODO(bg): native translation needed
    countOther: "{{count}} items"
  },
  settings: {
    // TODO(bg): native translation needed
    title: "Settings",
    // TODO(bg): native translation needed
    theme: "Theme: {{value}}",
    // TODO(bg): native translation needed
    font: "Font: {{value}}",
    // TODO(bg): native translation needed
    captions: "Captions: {{value}}",
    // TODO(bg): native translation needed
    provider: "Provider: anthropic ({{state}})",
    // TODO(bg): native translation needed
    providerConfigured: "configured",
    // TODO(bg): native translation needed
    providerMissing: "not configured"
  },
  permissions: {
    // TODO(bg): native translation needed
    title: "This app needs your camera, microphone, and location.",
    // TODO(bg): native translation needed
    rationale:
      "We scan your plot with the camera, listen for your intent with the microphone, and use location to compute setbacks and climate fallbacks. Nothing leaves the phone without your consent.",
    // TODO(bg): native translation needed
    grant: "Grant permissions"
  }
};
