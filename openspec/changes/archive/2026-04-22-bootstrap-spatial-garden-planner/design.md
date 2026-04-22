## Context

Target user: a home grower or small farmer standing on their plot in Chepinci (Sofia basin), earbuds in, phone in pocket. They speak intent ("I want to grade this slope and plant an orchard"). The app whispers back guidance, asks them to pan the camera, maps the yard, and returns a plan that is ecologically right _and_ legally compliant — without leaving the plot. Back at the kitchen table, the same app shows sectors, a year-over-year yield heatmap, and a science-backed rotation plan for next spring.

The user is dyslexic; the app must be readable by them and by other growers with low vision or hearing impairment. Accessibility is a first-class constraint, not a post-hoc audit.

Constraints shaping this design:

- **Offline-first / local-first.** The plot has weak cell coverage. Every core workflow must run with no network. Cloud is strictly optional.
- **BYOK reasoning, Anthropic only for MVP.** The user supplies their Anthropic API key. We never ship a default key or proxy. The interface stays extensible; we just don't ship other providers this round.
- **Side-loaded distribution.** Delivered as `.apk` over the Chepinci mesh. No Play Store review.
- **Accessibility is baseline.** Neutral pastel palette + full dark mode; dyslexia-friendly typography; WCAG 2.2 AA minimum, AAA toggle; cross-modal redundancy (never convey a state by color alone, never rely on audio without a caption, never rely on text without a TTS option).
- **Philosophy: "as complex as needed, as simple as possible".** Phone = sensory pass-through. All intelligence is in pure TypeScript cores that are testable without React Native.
- **Strict code conventions** (from user): package imports only (never relative cross-package), ≤300 lines/file, max 2 nesting levels, no `else if`, no `switch`, const arrow functions only (no `function` declarations), enums/errors from the config package, no `.js` extensions in imports, shared types in `@garden/config`.
- **Testing non-negotiable**: Jest with `it.each` factories across happy / side / critical / chaos paths for every engine module.

Stakeholders: the growing community in Chepinci/Sofia; the grower themselves (primary user, dyslexic); Maria-down-the-road (local seed supplier referenced by inventory); future contributors who will extend municipal rulesets, species databases, and the rotation/nutrient science tables; accessibility reviewers (dyslexia, low-vision, and deaf/HOH testers who must be in the loop before first release).

## Goals / Non-Goals

**Goals:**

- Establish a **Turborepo** monorepo with five packages (`@garden/config`, `@garden/core`, `@garden/memory`, `@garden/engine`, `@garden/ui`) and one app (`apps/mobile`).
- Land a decoupled **Spatial Topography & Compliance Engine** as pure TypeScript, callable from voice, screen, or future AR surfaces without change.
- Ship a working voice-first capture flow: "pan the camera → get a compliance verdict" for Sofia setback + slope + water-table rules.
- Ship **sector-based yield tracking**: the user can define sectors on a plot, log what was sown where, record harvest weights, and view year-over-year yield per sector.
- Ship a **science-backed rotation advisor** and **nutrient/water advisor** whose recommendations cite their sources (crop-family rotation tables, Liebig's Law, FAO-56 ET₀/Kc).
- Ship `@garden/ui` with neutral pastel light + dark themes, dyslexia-friendly typography, AA contrast (AAA toggle), screen-reader labels, and cross-modal redundancy verified by automated a11y tests.
- Prove the BYOK contract with the Anthropic provider behind the `ReasoningProvider` interface.
- Prove local-first persistence: a `MemoryRepository` over SQLite that survives offline use.
- Author repo-root `README.md` and `QUICKSTART.md`.
- Give every engine module a Jest `it.each` table covering the four flow classes.
- Lay out `apps/mobile` in Feature-Sliced Design with TanStack Query + Zustand state discipline, a React-bypassing transient store for 60 Hz spatial pose, Reanimated + Skia for native-thread rendering, a thin logger, and zero hardcoded values (all app runtime constants in `src/core/config.ts`).
- Ship an `useSpatialA11y` hook and the invisible-UI overlay pattern so screen readers can focus detected 3D objects.

**Non-Goals:**

- Full photogrammetric 3D reconstruction of the plot mesh.
- AR virtual-sapling rendering with time-scrubbed shadow projection (the "5-year preview" — deferred).
- iOS build.
- Automated submission of micro-permit PDFs to a live municipal registry. MVP generates the spec locally.
- Scraping Sofia zoning code in full. MVP encodes a tight, hand-curated rule set.
- Live weather / pest-image ML / mesh-network sync. Tracked as follow-ups.
- Multi-provider reasoning (OpenAI, local endpoints, etc.). Interface extensible; implementations ship later.
- Designing an AR UI beyond a minimal "green / red boundary" overlay stub.

## Decisions

### D1. Expo + React Native Android (side-loaded APK) over native Kotlin or a PWA

**Chosen:** Expo SDK (prebuild-managed) targeting Android first, distributed as `.apk`.

**Why:** Expo gives typed access to camera / sensors / location / speech / av / secure-store / sqlite / haptics through one JS runtime. A PWA cannot reliably access sensors on Android. Native Kotlin triples development surface for no MVP gain. `.apk` sideloading bypasses the Play Store approval loop the user explicitly wants to avoid.

**Alternatives considered:** Bare RN (more native control, more setup cost — rejected for MVP), Flutter (duplicates the TS ecosystem, loses the `@garden/*` sharing story), native Kotlin (too slow to iterate), Capacitor (sensor story thinner than Expo).

### D2. Turborepo monorepo with five `@garden/*` packages

**Chosen:** Turborepo + pnpm workspaces with five packages plus one app:

- `@garden/config` — enums (`TaskStatus`, `SpatialLimits`, `EventKind`, `CropFamily`, `NutrientCode`), the `SmepErrors` factory, all shared types. **Zero runtime dependencies.**
- `@garden/core` — pure primitives: the `Protocol` object, `summary` helpers (`success` / `warning` / `actionRequired` / `rejection`), event/sample factories, sensor-fusion math (`averagePitch`, `scanConfidence`), unit helpers, ET₀ Penman-Monteith kernel, pH-availability curve helpers.
- `@garden/memory` — `MemoryRepository` interface + `expo-sqlite` implementation for the device, `better-sqlite3` implementation for Node tests, numbered migrations.
- `@garden/engine` — compliance rule evaluator, species catalogue + matcher, rotation advisor, nutrient/water advisor, diagnosis-at-pin, and the `ReasoningProvider` interface + `anthropicProvider` implementation.
- `@garden/ui` — accessible theme tokens (pastel light + dark + AAA-high-contrast), a typed `Text` / `Button` / `Card` / `SectorTile` / `Caption` primitive set, the Lexend / OpenDyslexic font setup, and a11y helpers (announce, haptic). Consumed only by `apps/mobile`.

`apps/mobile` imports `@garden/*` by package name — never by relative path. A lint rule enforces this.

`turbo.json` defines `build`, `typecheck`, `lint`, `test`, and `apk` pipelines with correct inputs/outputs for caching.

**Why:** Turbo provides task-graph caching across packages so CI and local rebuilds stay fast as the monorepo grows. pnpm is the workspace manager Turbo is most optimized with. The five-package split matches the user's structural rule that shared types/enums live in config and that every cross-package import is by package name.

**Alternatives considered:** Single-package app (rejected — violates the "imports by package name" rule), Nx (Turbo is lighter and simpler), bun workspaces (no per-task caching graph — rejected as the repo grows).

### D3. Pure-function engine + thin sensory-pass-through UI

Every engine module is a `const fn = async (input, deps) => Summary` shape with dependencies injected. The UI collects inputs, calls the engine, and renders `Summary` verdicts. Voice, screen, and any future AR are alternate drivers over the same engine. The user's `evaluateTopographyCompliance` example is the north star.

**Trade-off:** Small DI ceremony cost everywhere. Worth it for testability and "same engine, many surfaces".

### D4. Local SQLite via `expo-sqlite` with a thin repository layer

**Chosen:** `expo-sqlite` on device + `better-sqlite3` for Node tests. Schema migrations as numbered SQL files run by an idempotent runner on startup. `MemoryRepository` hides the adapter.

**Why:** WatermelonDB adds decorators and a sync engine we don't need yet. `expo-sqlite` is the minimal local-first primitive. Swappable adapter keeps tests pure-Node.

### D5. Anthropic-only reasoning behind an extensible `ReasoningProvider` interface

**Chosen:** In `@garden/engine`, define:

```ts
export type ReasoningProvider = {
  readonly id: string;
  readonly ask: (prompt: string, context: ReasoningContext) => Promise<ReasoningResult>;
};
```

Ship one implementation: `anthropicProvider` using `@anthropic-ai/sdk` with the latest Claude model. Key lives in `expo-secure-store`. The settings screen has a single BYOK field. No default key, no proxy.

**Why:** The user asked for one provider in MVP. Keeping the interface as-is (no coupling to Anthropic-specific types in consumers) means a future `add-openai-provider` change is additive, not refactor-heavy.

**Trade-off:** Users who prefer a self-hosted LLM cannot use the app until a follow-up change. Explicit non-goal; documented.

### D6. Voice-first, always-captioned, cross-modal UX

**Chosen:** `expo-speech` for TTS, `expo-av` + Android `SpeechRecognizer` for STT. Every spoken utterance is also rendered as a **persistent caption line** on the current screen. Every on-screen verdict is also announced (or available on-demand via a "Read aloud" tap). Every verdict also fires a distinguishing haptic pattern (success / warning / rejection).

**Why:** The user is dyslexic; some test users will be deaf or hard of hearing; some will have low vision. Serving any one of those well means serving all three — output on three channels (voice, text, haptic) and input on two (STT, tap).

**Trade-off:** Triple-rendering means extra code at each surfacing point. Mitigation: centralise in `@garden/ui`'s `Announce(summary)` primitive so every consumer gets all three channels with one call.

### D7. Accessibility-first theming: neutral pastel + dark mode

**Chosen:** A token system in `@garden/ui/theme` with three themes:

- `light-pastel` — background `#F6F3EE` (warm parchment), primary `#A7C7A5` (sage), accent `#C9B8D9` (lavender), success `#9EC4A6`, warning `#E6C38B`, error `#D69A9A`. Every foreground/background pair checked at AA (4.5:1 body, 3:1 large).
- `dark-pastel` — background `#1E1F22` (charcoal), primary `#8DB58B`, accent `#B3A0C6`, muted surface `#2A2C30`. AA-verified.
- `high-contrast` — AAA pair set, chosen from the same pastel hues at maximum contrast, triggered by the Accessibility settings.

Typography: Lexend (default) — research-backed for dyslexic readers; OpenDyslexic available as an opt-in in settings. Base body size 18sp, line height 1.55, letter-spacing 0.02em. No italics for paragraph text (dyslexia-hostile). Headings use weight, not italic, for emphasis.

**Why:** Neutral pastels reduce visual fatigue, especially outdoors on a phone in sun. Dark mode halves glare at dusk. Lexend has measurable reading-speed gains for dyslexic adults. 18sp + 1.55 line height clears the WCAG SC 1.4.12 threshold.

**Alternatives considered:** Material You dynamic color (rejected — unstable contrast on user devices), pure black-on-white (rejected — worst-case for dyslexia fatigue and sun glare), saturated palette (rejected — painful AA compliance).

### D8. Canonical data contracts: `Protocol`, `Summary`, `Sector`, `Harvest`, `SoilSample`

`Protocol` (in `@garden/core`) is `{ id, capturedAt, confidence, data: ScanData }` where `ScanData` has `distanceToPropertyLine`, `slopeDegree`, `waterTableDepth`, and optional `orientationDegrees`, `elevationMeters`, `soilSampleIds`. `Summary` is `{ type, message, meta? }`. `Sector` is `{ id, plotId, name, polygon, createdAt }`. `Harvest` is `{ id, sectorId, speciesId, weightGrams, harvestedAt, notes? }`. `SoilSample` is `{ id, pinOrSectorId, capturedAt, pH, texture, npk?, micros?, organicMatterPct?, ec? }`. All shared types live in `@garden/config` so no package redefines them.

### D9. Enums and errors centralised in `@garden/config`

`TaskStatus`, `SpatialLimits`, `EventKind`, `CropFamily` (`SOLANACEAE`, `BRASSICACEAE`, `FABACEAE`, `CUCURBITACEAE`, `APIACEAE`, `POACEAE`, `ALLIACEAE`, `ASTERACEAE`, `ROSACEAE`), `NutrientCode` (`N`, `P`, `K`, `CA`, `MG`, `S`, `B`, `FE`, `MN`, `ZN`, `CU`, `MO`). `SmepErrors` factory (`protocolEmpty`, `captureTooShort`, `providerNotConfigured`, `repositoryUnavailable`, `invalidProviderConfig`, `insufficientSoilData`, `sectorNotFound`, `unsupportedClimateZone`). No bare `new Error(...)` anywhere outside this package.

### D10. Testing with Jest + `it.each` factories, four flow classes per module

For each engine module: `describe("happy & side")` with an `it.each` table of `[label, input, expectedStatus, expectedSummaryType]`; `describe("chaos")` for invariants and thrown errors. Test factories (`createMockMemoryRepo`, `createMockReasoningProvider`, `createProtocol(overrides)`, `createSector(overrides)`, `createHarvest(overrides)`) live in `__test-utils__/` per package.

### D11. Sofia municipal rules as hand-curated data, not a scraper

`packages/engine/src/rules/sofia.ts` exports an array of `ComplianceRule` objects the evaluator iterates with early-return. Each rule has `{ id, reference, check: (data) => Verdict | null }`. A future change can add ingestion.

### D12. Rotation advisor grounded in crop-family rotation science

`packages/engine/src/rotation/` contains:

- `families.ts` — typed `CropFamily` → member-species map.
- `rotation-rules.ts` — typed array of rules: "avoid same family within N years"; "legume → heavy-feeder preferred"; "allium → brassica OK"; each rule cites a source (e.g., Coleman _The New Organic Grower_, USDA SARE rotation guides).
- `companions.ts` — typed pair-affinity table (three sisters, basil↔tomato, marigold pest deterrence; each cites a peer-reviewed or extension-service source).
- `advise-rotation(sectorHistory, availableSpecies)` returns a ranked list with `{ speciesId, score, reasons: RotationReason[] }`, where each reason carries the source citation.

**Why:** Rotation advice that doesn't explain _why_ is indistinguishable from a horoscope. Grounding every recommendation in a citation keeps the app honest and lets a knowledgeable reviewer audit the table.

### D13. Nutrient/water advisor: Liebig's Law + FAO-56 Penman-Monteith

**Chosen:** `packages/engine/src/nutrient/`:

- `species-demand.ts` — typed per-species nutrient targets (N/P/K + micros) and target soil pH range, with citations (extension-service bulletins, agronomy references).
- `liebig.ts` — `computeLimitingFactor(sample, demand)` returns the single most-limiting nutrient (the one farthest below target, normalised). All amendments downstream lead with fixing the limiting factor.
- `et0-penman-monteith.ts` — FAO-56 reference evapotranspiration from lat/lon, elevation, day-of-year, and temperature/humidity/wind/solar proxies (user-supplied or defaulted to Sofia-basin climatology tables when offline).
- `kc-tables.ts` — typed per-species / growth-stage crop coefficients.
- `advise-water(species, sectorClimate, growthStage)` → mm/week irrigation target; `advise-amendments(sample, species)` → prioritised list of amendments citing the limiting factor.

**Why:** Liebig's Law is the right first-principles frame: fixing anything other than the limiting nutrient is wasted effort. FAO-56 is the industry standard for irrigation scheduling and ships well as a pure function. Keeping the science in typed data files means an agronomist can review one file per domain.

**Trade-off:** Without live weather, ET₀ falls back to climatology averages, which is less precise than a real station. Documented; flagged as a warning in the summary's `meta`.

### D14. Voice loop: always-caption, always-haptic, always-announce

One helper in `@garden/ui`: `announce(summary, { channels })` — default `channels = { tts: true, caption: true, haptic: true }`. Consumers call `announce`, not individual channel APIs. Captions persist on-screen for at least 5 seconds or until dismissed. Haptic patterns differ per `summary.type` (success: single short; warning: double short; actionRequired: triple short; rejection: long). This guarantees the cross-modal contract is never silently broken.

### D15. Species / rotation / nutrient catalogues are reviewable data files

Every science table is a typed `.ts` data file (not a JSON fetched from cloud, not inline in a module). Adding a species, rule, or Kc coefficient MUST be a pure data-file addition — zero evaluator code changes. CI checks that the data files parse and that every entry carries a `sourceCitation` field.

### D16. UI primitives: react-native-paper with heavy custom theming

**Chosen:** `react-native-paper` (MD3) as the primitive library in `@garden/ui`, wrapped by our own primitives (`Text`, `Heading`, `Button`, `Card`, `SectorTile`, `Caption`, `AmendmentRow`, `RecommendationRow`) so consumers never import Paper directly. A custom MD3 theme maps Paper's surface/primary/secondary tokens to our pastel palette; Paper's typography system is overridden with Lexend (default) and OpenDyslexic (opt-in). Ripple effects are disabled in favor of a subtle opacity fade so the UI stays quiet and doesn't feel "Android-stock".

**Why:** Paper ships accessible, TalkBack-tested primitives (correct `accessibilityRole`, focus order, state announcements, touch-target sizes) that would be a meaningful hand-rolling effort to replicate and easy to get subtly wrong — exactly the kind of mistake that hurts a dyslexic or low-vision user most. Wrapping Paper behind `@garden/ui` primitives means: (a) if we ever swap libraries, consumers don't change; (b) we can enforce our plain-language / cross-modal / Lexend defaults at the wrapper layer; (c) Paper's MD3 styling can be neutralized with pastel tokens so the visual language stays ours.

**Alternatives considered:** Pure Expo primitives with hand-rolled a11y (rejected for MVP: real effort, real risk of breaking screen-reader semantics in subtle ways; could revisit if Paper's Material aesthetic proves incorrigible). Tamagui (faster, more flexible styling — but a11y primitives are less mature and the setup ceremony is heavier; revisit in a follow-up if performance becomes an issue). Gluestack / NativeBase (weaker a11y track record).

**Trade-offs:** Paper adds ~200 KB to the APK. Acceptable for the a11y win. Paper's MD3 assumes a light-primary / dark-secondary model that we override — every Paper component has to be wrapped to re-route color. Mitigation: a single `@garden/ui/paper-theme.ts` does the mapping once; primitives extend Paper's components minimally.

### D17. README + QUICKSTART from day one

Repo-root `README.md` explains architecture, the `@garden/*` package layout, the convention rulebook, and the accessibility baseline. `QUICKSTART.md` walks a new user from `git clone` to an `.apk` on a physical Android device in a numbered ten-step list, including "add your Anthropic key", "grant camera + mic + location permissions", and "complete your first boundary walk". Both docs must be readable by the target user (plain language, short sentences, bullet-heavy; dyslexia-friendly in prose as well as UI).

### D18. Package scope: `@garden/*`

**Chosen:** `@garden/config`, `@garden/core`, `@garden/memory`, `@garden/engine`, `@garden/ui`. Not published to npm during MVP (workspace-local only). If a public release is desired later, `@garden` would need to be an owned npm scope — if unavailable, rename to a scope the user controls.

### D19. Feature-Sliced Design inside `apps/mobile`

**Chosen:** The mobile app is organized by _feature_, not by file type:

```
apps/mobile/
├── app/                              # Expo Router — glue only, near-zero business logic
├── src/
│   ├── core/                         # Globally shared pieces
│   │   ├── config.ts                 # ALL app runtime constants (no hardcoded values)
│   │   ├── api/                      # Base HTTP wrapper (skeleton for future; not used in MVP)
│   │   ├── logger/                   # createLogger(tag) factory + transports
│   │   ├── query/                    # TanStack Query client + default options
│   │   └── theme/                    # App-level theme bridge into @garden/ui
│   ├── engine/                       # Spatial bridge (heavy math, React-bypassing)
│   │   ├── spatial-store.ts          # Zustand transient store for 60Hz pose
│   │   ├── capture-driver.ts         # Expo sensor fusion → @garden/core Protocol
│   │   ├── reanimated/               # Native-thread worklets
│   │   └── skia/                     # Canvas overlays, heatmap paint, focus rings
│   └── features/                     # Feature silos — each self-contained
│       ├── capture/                  # Boundary walk + compliance flow
│       ├── sectors/                  # Sector editor + geometry
│       ├── yield/                    # Year-over-year yield + sector heatmap
│       ├── rotation/                 # Rotation recommendations
│       ├── nutrient/                 # Amendments + irrigation
│       ├── inventory/                # Seeds/plants/events
│       ├── voice/                    # STT/TTS loop + announce helper wiring
│       ├── a11y/                     # Spatial a11y (invisible-UI + announcer hook)
│       ├── overlay/                  # Minimal persistent chrome
│       └── settings/                 # Accessibility + BYOK key
```

Each feature folder holds its own `components/`, `hooks/`, `store/` (Zustand), and `types/`. **If a feature folder is deleted, the rest of the app (minus the route) still compiles.**

**Why:** Grouping by type (all hooks in `hooks/`, all components in `components/`) turns into spaghetti once the app has more than a handful of features. Feature silos prevent leak-across and make contributor onboarding a matter of opening one folder. This is the gold-standard React Native layout for 2026-scale apps.

**Trade-off:** Cross-feature hooks (e.g., a rotation view needing yield history) must be imported across feature boundaries. Rule: cross-feature imports allowed _from_ feature A into feature B only if B's hook is considered a public surface documented in its `index.ts`. An ESLint boundary rule enforces this.

### D20. State discipline: TanStack Query + Zustand, no Redux

**Chosen:**

- **TanStack Query** for everything that reads from or writes to `MemoryRepository` or `ReasoningProvider`. Local SQLite reads are treated as "server state" — query cache, loading/error states, invalidation, optimistic updates. Anthropic calls use `useMutation`.
- **Zustand** for client-only UI state (menu open, active tab, current capture mode, TTS-muted flag, theme preference in-memory mirror).
- **No Redux.** No Redux Toolkit. No Redux Saga.
- Feature hooks live in `src/features/<feature>/hooks/` and wrap either TanStack Query (`useSectorYield(sectorId, year)`, `useComplianceVerdict()`) or Zustand (`useCaptureMode()`).

**Why:** TanStack Query eliminates the entire Redux "loading / error / refetch / stale-while-revalidate" surface. Zustand is ~1 kB, hook-first, no boilerplate. Together they cover every state shape the app needs. This is the same architecture the user specified as the 2026 React Native gold standard, and it aligns with the pure-engine / thin-UI philosophy: UI components call a hook, the hook handles settlement, the component renders the result.

**Example** (illustrative, belongs in the app, not in specs):

```ts
// apps/mobile/src/features/yield/hooks/use-sector-yield.ts
import { useQuery } from "@tanstack/react-query";
import { yieldBySectorAndYear } from "@garden/engine";
import { memoryRepository } from "@/core/query/repository";

export const useSectorYield = (sectorId: string, year: number) =>
  useQuery({
    queryKey: ["yield", sectorId, year],
    queryFn: () => yieldBySectorAndYear(memoryRepository, sectorId, year)
  });
```

**Trade-off:** TanStack Query's cache eats memory; on very old devices with huge inventory tables, we may need to tune `gcTime` / `staleTime`. Mitigation: defaults live in `core/config.ts`; CI performance budget test on a low-end fixture device after first follow-up.

### D21. Spatial-state performance guard — bypass React's render cycle

**Chosen:** The live spatial pose during capture (position, pitch, yaw, roll, sampled at up to 60 Hz) MUST NOT live in React `useState`. Two mechanisms:

- **Zustand transient updates** — subscribers use `useStore.subscribe(selector, callback)` (non-hook API) to receive updates without triggering a component re-render. Reanimated worklets and the Skia canvas read from this store.
- **`useRef`** for single-component-scope mutable spatial values that never need to propagate.

A React component that needs to _display_ a spatial value throttles itself via `useSyncExternalStore` with a selector that is stable unless the displayed value changes beyond a threshold (e.g., 1°, 0.1m). The engine's emitted `Protocol` object remains a batched snapshot and is the only thing that flows through React-state paths.

**Why:** Re-rendering at 60 Hz melts even mid-range Android devices, kills battery, and stutters the camera preview. This is the most common failure mode of spatial apps and the single architectural decision that determines whether the capture flow is usable.

**Trade-off:** Code that consumes live pose must learn a non-hook subscription API. Mitigation: wrap the pattern in a single `useThrottledPose(threshold)` hook in `src/engine/` that every feature uses — the pattern is touched in exactly one place.

### D22. Spatial a11y: invisible-UI overlays + `useSpatialA11y`

**Chosen:** Screen readers assume a 2D grid. To make 3D objects discoverable:

- For every spatial object that should be focusable (a detected boundary corner, a sector polygon, a compliance overlay), we render a transparent React `View` at the object's projected screen rectangle. The `View` carries a full `accessibilityLabel` / `accessibilityRole` / `accessibilityHint`. TalkBack focuses the `View`; the user hears the description.
- A `useSpatialA11y` hook in `src/features/a11y/` subscribes to the spatial store and calls `AccessibilityInfo.announceForAccessibility(...)` for spatial events: device-facing-changed, object-detected, compliance-verdict-updated. Each announcement is paired with a haptic pattern per the `announce()` cross-modal contract (D14).

**Why:** The app's visual UI is intentionally minimal (voice-first + camera pass-through). That makes accessibility _harder_, not easier — there's nothing for a screen reader to focus on unless we build invisible affordances. The invisible-UI pattern is the standard solution for 3D/AR screen-reader compatibility.

**Trade-off:** Invisible `View` rectangles need to update as the user moves the camera. Throttling via D21's pose subscription keeps this cheap.

### D23. Native-thread rendering: Reanimated + Skia

**Chosen:** `react-native-reanimated` for worklet-driven animations and math on the UI thread; `@shopify/react-native-skia` for the capture overlay, sector heatmap, compliance boundary paint, and focus rings. Spatial values read from the transient Zustand store (D21) via Reanimated shared values.

**Why:** React Native's JS thread cannot sustain 60 Hz animation while the JS bridge is also processing sensor samples and TanStack Query cache updates. Reanimated runs animation logic on the UI thread; Skia draws on a GPU canvas — both bypass the bottleneck. Skia's imperative canvas API also makes AA-compliant focus rings, numeric heatmap labels, and the compliance green/red overlay straightforward to render with pixel control (important for accessibility-verified contrast).

**Trade-off:** Reanimated requires the Babel plugin and a prebuild step on Expo. Skia adds ~1 MB to the APK. Both are accepted industry costs for this class of app.

### D24. Hand-rolled thin logger with a transport slot

**Chosen:** `apps/mobile/src/core/logger/index.ts` exports `createLogger(tag: string)` returning `{ debug, info, warn, error }`. Per-level filter is read from `core/config.ts`. The default transport prints to `console` in development and is a no-op above a configured level in production. A `setTransport(fn)` setter lets future work swap in Sentry or another sink without touching callers.

**Why:** The user asked for a logger "for now, for debugging; I may consider adding something else later." A library (pino, react-native-logs) is more surface than we need. A 30-line factory covers the requirements and leaves the door open for a real sink via the transport slot.

**Trade-off:** No structured-log JSON by default. Can be added in the transport if/when a sink demands it.

### D25. Zero hardcoded values — app constants in `core/config.ts`

**Chosen:** `apps/mobile/src/core/config.ts` is the single source of truth for every runtime app constant: capture window duration, confidence thresholds, query `staleTime` / `gcTime`, TTS rate, caption TTL, haptic-pattern durations, default theme, default font, log level, Anthropic model id (re-exported from `@garden/config`), feature flags. An ESLint rule forbids numeric or string literal "magic values" in components and hooks — they MUST be imported from `core/config.ts` (or from `@garden/config` for cross-package enums/types).

The relationship to `@garden/config` is **complementary, not overlapping**:

| Lives in `@garden/config`                                                     | Lives in `apps/mobile/src/core/config.ts`                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Cross-package enums (`TaskStatus`, `EventKind`, `CropFamily`, `NutrientCode`) | App-only runtime constants (capture window ms, caption TTL, log level) |
| Shared TypeScript types (`Protocol`, `Summary`, `Sector`, `Harvest`)          | Expo / RN runtime settings, feature flags                              |
| `SmepErrors` factory                                                          | Query client `staleTime`, Zustand store defaults                       |
| `SpatialLimits` (Sofia municipal values)                                      | Haptic pattern durations, TTS rate, default theme id                   |

**Why:** Every magic number in a spatial + a11y app is a bug waiting to happen. Centralising them makes them reviewable in one file and swappable without chasing imports.

**Trade-off:** `core/config.ts` grows over time; keep it sectioned with comments and ≤300 lines per the project rulebook (split into sub-files if needed).

## Risks / Trade-offs

- [**Accessibility regression**] — Pastel palettes are beautiful but hard to keep at AA; a single careless token change can break contrast everywhere. → Mitigation: CI runs an automated contrast check over every `@garden/ui/theme` token pair; PRs that drop any pair below AA fail. Snapshot tests render key screens in light, dark, and AAA modes.
- [**Compliance misinformation**] — Hand-curated Sofia rules could be wrong or outdated, and the app will confidently tell the user "compliant". → Mitigation: every non-success verdict carries `sourceRuleId`, `reference`, and `disclaimer`; MVP copy makes clear the verdicts are advisory. Follow-up: cite municipal article numbers.
- [**Rotation/nutrient pseudo-expertise**] — Science-flavoured recommendations without a source reviewer are still horoscopes. → Mitigation: every recommendation carries a `sourceCitation` field at data-file level; a reviewer checklist requires a named agronomist / extension service per citation before MVP ships; CI fails if a new data entry has no citation.
- [**Dyslexia-friendly in EN vs. BG**] — Lexend is excellent for Latin script; the user base will need Bulgarian (Cyrillic) eventually. Lexend covers Cyrillic only partially. → Mitigation: scope MVP to EN interface, flag BG as the next-change priority; pick a Cyrillic-complete dyslexia-friendly face (e.g., Atkinson Hyperlegible) for the BG follow-up.
- [**Sensor capture fidelity**] — `expo-sensors` pitch/roll + camera pan are a poor substitute for LiDAR; slope readings are noisy. → Mitigation: average over an N-second window, surface a confidence score, refuse to verdict below threshold.
- [**BYOK trust / key leakage**] — Storing the Anthropic key on a sideloaded APK means a compromised device exposes it. → Mitigation: `expo-secure-store` with hardware Keystore when available; provider id visible; never logged.
- [**Android fragmentation**] — Sideloaded `.apk`s run on wildly different devices. → Mitigation: pin Expo SDK + RN versions; universal APK; document minimum Android version in QUICKSTART.
- [**Engine/UI coupling creep**] — "Decoupled pure engine" erodes fast once AR and streaming voice land. → Mitigation: lint rule forbids `expo-*` / `react-native` / `@garden/ui` imports inside `@garden/{config,core,memory,engine}`. CI fails the build.
- [**Convention drift**] — 10+ rules (no `else if`, ≤300 lines, etc.) are hard to enforce by review alone. → Mitigation: ESLint `no-else-if`, `max-lines: 300`, `max-depth: 2`, `no-restricted-syntax` (block `switch`, `function` declarations, relative cross-package paths, `.js` import extensions), fail CI on violation.
- [**Scope creep toward the 5-year preview**] — The AR time-lapse is the most seductive demo; pulling it forward sinks the bootstrap. → Mitigation: explicit Non-Goal; `time-lapse-preview` lives as a follow-up capability only.

## Migration Plan

First change; nothing to migrate. Rollback = delete the `bootstrap-spatial-garden-planner` change folder and the generated `packages/` + `apps/` directories.

Forward path after this change lands:

1. `add-time-lapse-preview` — AR sapling projection + shade scrub slider.
2. `add-weather-context` — live forecast + ET₀ refinement against real stations.
3. `add-bg-localization` — Bulgarian UI + Atkinson Hyperlegible Cyrillic font.
4. `add-openai-provider` / `add-local-endpoint-provider` — additional `ReasoningProvider` implementations.
5. `expand-compliance-ruleset` — broader Sofia zoning code.
6. `add-mesh-sync` — peer-to-peer `MemoryRepository` sync.

## Open Questions

- **STT on-device library choice.** Android `SpeechRecognizer` needs connectivity in several locales; is there an acceptable offline model (Vosk?) small enough to bundle in an APK? Decide before voice capture lands.
- **Property-line source of truth.** Can we get Chepinci cadastral polygons from an open source, or must the user walk the boundary? MVP assumes user-walked; confirm with a local surveyor.
- **Species / rotation / nutrient reviewer.** Need a named agronomist or extension service per data file before MVP ships. Who?
- **Font licensing.** Lexend is SIL Open Font License — safe to bundle. OpenDyslexic is Bitstream Vera-derived OFL — safe. Confirm at build time.
- **Permit generator format.** Is the Sofia micro-permit form available as a fillable PDF template we can populate, or do we emit a plain-text spec the user copies manually? MVP: plain-text spec; revisit.
- **Climate data source for ET₀ fallback.** Which Sofia-basin climatology table do we bundle when no live weather is available? Need a citable source.
