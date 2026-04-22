/** The English locale is the source of truth. Every other locale must mirror
 * this shape; the TypeScript compiler enforces that via `TranslationKeys`.
 */
export const en = {
  common: {
    loading: "Loading…",
    readyToScan: "Ready to scan.",
    scanning: "Scanning…"
  },
  capture: {
    title: "Scan the slope",
    startCapture: "Start capture"
  },
  sectors: {
    title: "Sectors",
    countOne: "{{count}} sector",
    countOther: "{{count}} sectors"
  },
  yield: {
    title: "Year-over-year yield",
    countOne: "{{count}} sector",
    countOther: "{{count}} sectors"
  },
  rotation: {
    title: "Rotation recommendations",
    countOne: "{{count}} recommendation",
    countOther: "{{count}} recommendations"
  },
  nutrient: {
    title: "Amendments and irrigation",
    mmPerWeek: "{{mm}} mm / week"
  },
  inventory: {
    title: "Inventory",
    countOne: "{{count}} item",
    countOther: "{{count}} items"
  },
  settings: {
    title: "Settings",
    theme: "Theme: {{value}}",
    font: "Font: {{value}}",
    captions: "Captions: {{value}}",
    provider: "Provider: anthropic ({{state}})",
    providerConfigured: "configured",
    providerMissing: "not configured"
  },
  permissions: {
    title: "This app needs your camera, microphone, and location.",
    rationale:
      "We scan your plot with the camera, listen for your intent with the microphone, and use location to compute setbacks and climate fallbacks. Nothing leaves the phone without your consent.",
    grant: "Grant permissions"
  }
} as const;

export type TranslationKeys = typeof en;
