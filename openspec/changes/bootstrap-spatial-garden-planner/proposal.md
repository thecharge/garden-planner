## Why

Home growers and small farmers in Chepinci (Sofia basin) lose years to mistakes a commercial SaaS garden planner cannot catch: bad drainage, illegal setbacks, wrong species for clay soil, shade miscalculations, and months of municipal paperwork. Existing planners draw flat 2D pictures from generic databases and leave the hard, place-specific part to the user.

This change bootstraps a **local-first, voice-led, accessibility-first spatial planner** that negotiates the physical, legal, and ecological reality of the *specific* plot being walked on — and that remembers what was planted where, how each sector performed year over year, and what the science says to plant there next. It turns a multi-year, multi-disciplinary process into a ten-minute conversation with the environment. The app is inclusive by default: designed with dyslexia, low vision, and hearing impairment accommodated in the core UI — not bolted on.

## What Changes

- **NEW** Expo (React Native) Android-first app, side-loadable as `.apk`, with a minimal **but functional** UI that surfaces sectors, year-over-year yield, rotation suggestions, and nutrient/water guidance on demand.
- **NEW** **Turborepo** monorepo in TypeScript (`@garden/config`, `@garden/core`, `@garden/memory`, `@garden/engine`, `@garden/ui`) plus `apps/mobile`. Strict code conventions apply to every package (≤300 lines/file, max 2 nesting levels, no `else if`, no `switch`, const arrow functions only, enums/errors from the config package, imports by package name only).
- **NEW** Local-first persistence (SQLite via `expo-sqlite`) exposed through `MemoryRepository`. All features run offline; cloud is strictly optional.
- **NEW** Decoupled **Spatial Topography & Compliance Engine** — a pure TypeScript core (no RN deps) that takes a `Protocol` plot scan and returns a `summary` (`success` / `warning` / `actionRequired` / `rejection`) against Sofia municipal rules (setbacks, slope, water table). UI, voice, and AR are sensory pass-throughs over this core.
- **NEW** Hardware sensing via `expo-camera` / `expo-sensors` / `expo-location` producing `Protocol` objects.
- **NEW** **Sector / yield tracking** — subdivide a plot into named sectors, record what was sown/transplanted where, log harvest weights, and render year-over-year yield history.
- **NEW** **Rotation advisor** — recommends next year's planting per sector using crop-family rotation rules, nitrogen-fixer cycling, and companion-planting science. Every recommendation cites its scientific source in a typed data file.
- **NEW** **Nutrient & water advisor** — recommends amendments (N/P/K, Ca, Mg, micronutrients, organic matter) and irrigation targets derived from FAO-56 Penman-Monteith reference evapotranspiration (ET₀) and plant coefficient (Kc) tables, gated by Liebig's Law of the Minimum on soil-sample data.
- **NEW** Voice-first interaction (`expo-speech`, `expo-av`) with an **always-captioned** fallback: every spoken whisper is simultaneously rendered on-screen for hearing-impaired users; every on-screen verdict is simultaneously spoken and haptically confirmed.
- **NEW** **Accessibility-first UI kit** in `@garden/ui`: neutral pastel palette with full dark mode, dyslexia-friendly typography (Lexend default + OpenDyslexic option), WCAG 2.2 AA contrast (AAA mode available), minimum 18pt body text, 1.5× line height, cross-modal redundancy (no status conveyed by color alone), and full TalkBack / screen-reader labels on every interactive element.
- **NEW** **Anthropic-only reasoning** for MVP — a single `ReasoningProvider` interface with one shipped implementation (`anthropicProvider`). BYOK through `expo-secure-store`. Interface stays extensible so other providers can be added later without touching consumers.
- **NEW** Inventory tracking for seeds, plants, soil samples, and pest-control events, tied to spatial pins.
- **NEW** Jest testing with `it.each` factories covering happy / side / critical / chaos paths for every engine module.
- **NEW** `SmepErrors` error factory, `TaskStatus` / `SpatialLimits` / `EventKind` enums, and all shared types in `@garden/config`.
- **NEW** Repo-root `README.md` and `QUICKSTART.md` — the quickstart walks a first-time user from cloned repo to a side-loaded `.apk` on an Android device in under ten steps.
- **NEW** **Feature-Sliced Design** layout inside `apps/mobile`: `app/` for Expo Router glue only, `src/core/` for globally shared pieces (config, logger, query, theme), `src/engine/` for the spatial bridge (React-bypassing Zustand transient store, Reanimated worklets, Skia overlays), `src/features/<feature>/{components,hooks,store,types}` for feature silos. Each feature is self-contained — deleting a feature folder must not break the rest of the app.
- **NEW** **State discipline**: **TanStack Query** for all reads/writes that pass through `MemoryRepository` or `ReasoningProvider` (treats local SQLite and Anthropic calls uniformly as "server state" with cache, loading, error). **Zustand** for client UI state (menu open, active mode). **Zustand transient updates** (subscribe without re-render) + `useRef` for 60Hz spatial pose so the capture loop does not melt the UI thread. No Redux.
- **NEW** **Reanimated** + **Skia** for spatial overlays, focus rings, and the sector heatmap paint — animation and math on the native thread, not JS.
- **NEW** Spatial-a11y adapter: transparent React `View` overlays placed over detected 3D objects so screen readers can focus them; a `useSpatialA11y` hook translates spatial events into `AccessibilityInfo.announceForAccessibility` calls paired with haptics.
- **NEW** Thin hand-rolled **logger** in `apps/mobile/src/core/logger/`: `createLogger(tag)` → `{ debug, info, warn, error }` with per-level filter and a transport slot for a future remote sink.
- **NEW** **Zero hardcoded values** in the app: every runtime constant (capture windows, query stale times, haptic patterns, caption TTL, fallback climate keys, log levels) lives in `apps/mobile/src/core/config.ts`. Cross-package enums and error factories remain in `@garden/config` — the two are complementary and non-overlapping.

## Capabilities

### New Capabilities

- `local-first-storage`: Offline-first SQLite persistence exposed via `MemoryRepository`; owns the `Protocol` schema, task status transitions, inventory, events, sectors, harvests, and soil samples.
- `spatial-topography`: Camera + sensor capture producing a normalized `Protocol` (slope, orientation, distance-to-boundary, water-table depth, confidence), decoupled from rendering.
- `compliance-engine`: Pure-function rule evaluator against Sofia municipal setback / slope / water-table rules; returns verdicts plus auto-generated micro-permit specs.
- `soil-intelligence`: Local catalogue of Chepinci/Sofia-basin soil profiles, water-table hints, and species-to-site matching.
- `yield-tracking`: Sectors on a plot, seed-history per sector, harvest logs, year-over-year yield rendering, and visual sector heatmap of productive vs. unproductive beds.
- `rotation-advisor`: Science-backed next-year planting recommendations per sector — crop-family rotation, legume-after-heavy-feeder nitrogen cycling, and companion-planting pairings — with citations in a typed data file.
- `nutrient-advisor`: Per-sector amendment and irrigation recommendations grounded in soil-sample data, target-crop nutrient demand, Liebig's Law of the Minimum, and FAO-56 Penman-Monteith ET₀ with Kc coefficients.
- `inventory-tracking`: Seeds, plants, tools, soil samples, pest events; time-stamped and spatial-pin-linked; append-only audit trail.
- `voice-interaction`: Voice-first STT / TTS with always-on captioning, haptic confirmations, and on-screen fallback so no capability is gated on voice availability.
- `accessibility`: Neutral pastel + dark theme, dyslexia-friendly typography, WCAG AA (AAA toggle), cross-modal redundancy, screen-reader labels, and configurable contrast / font / motion settings — applied as the baseline UI contract, not as a post-hoc mode.
- `reasoning-provider`: `ReasoningProvider` interface with a single shipped Anthropic implementation; BYOK via `expo-secure-store`; interface kept extensible for follow-up providers.
- `mobile-architecture`: Feature-Sliced Design inside `apps/mobile`; TanStack Query + Zustand state discipline; 60Hz spatial pose bypasses React via transient store; Reanimated + Skia for native-thread rendering; centralised app config; hand-rolled logger with transport slot.

### Modified Capabilities

None — this is the repo's first change; `openspec/specs/` is empty.

## Impact

- **New runtime surface**: Expo/RN Android app. No backend required for MVP.
- **New packages**: `@garden/config`, `@garden/core`, `@garden/memory`, `@garden/engine`, `@garden/ui`, plus `apps/mobile`. Package scope name is a project decision; rename is a single find/replace if `@garden/*` is not desired.
- **New tooling**: Turborepo (`turbo.json` with `build` / `typecheck` / `lint` / `test` pipelines), pnpm workspaces under Turbo, TypeScript `paths` aliases for `@garden/*`, ESLint + Prettier + lint-staged.
- **New dependencies**: Expo SDK (camera, sensors, location, speech, av, secure-store, sqlite, haptics, localization), `@anthropic-ai/sdk`, `react-native-paper`, `@tanstack/react-query`, `zustand`, `react-native-reanimated`, `@shopify/react-native-skia`, `expo-router`, Jest + ts-jest, `better-sqlite3` (dev only) for Node-side tests.
- **New permissions**: Android camera, microphone, location, storage.
- **Distribution**: Side-loaded `.apk` via the Chepinci mesh — no Play Store gate for MVP.
- **New docs**: `README.md` (architecture, conventions, package layout) and `QUICKSTART.md` (clone → install → device build → first scan → first sector → first verdict).
- **Non-goals for this change** (deferred to follow-ups): full photogrammetric 3D reconstruction; AR virtual-sapling rendering with time-scrubbed shadow projection (the "5-year preview" vision); live weather API integration; pest-identification ML; mesh-network sync between devices; iOS build; automated submission of permits to a live municipal registry (MVP emits the spec locally and the human files it); scraping the full Sofia zoning code (MVP encodes a tight, hand-curated rule set); multi-provider reasoning (Anthropic only for MVP, interface left open).
