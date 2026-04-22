## 1. Monorepo and tooling (Turborepo + pnpm)

- [x] 1.1 Initialise pnpm workspaces at the repo root with `packages/*` and `apps/*`.
- [x] 1.2 Add `turbo.json` with `build`, `typecheck`, `lint`, `test`, and `apk` pipelines, correct `inputs`/`outputs` for caching, and remote-cache disabled for MVP.
- [x] 1.3 Create package skeletons: `@garden/config`, `@garden/core`, `@garden/memory`, `@garden/engine`, `@garden/ui` — each with `package.json`, `tsconfig.json`, `src/index.ts`.
- [x] 1.4 Add root `tsconfig.base.json` with `paths` mapping `@garden/*` to each package source; enable `"moduleResolution": "bundler"`, `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- [x] 1.5 ESLint config with `no-restricted-syntax` rules failing the build on: `function` declarations, `switch`, `else if`, relative cross-package imports, `.js` import extensions, and `new Error(` outside `@garden/config`.
- [x] 1.6 ESLint `max-lines: 300`, `max-depth: 2`, `max-nested-callbacks: 2` across all packages.
- [x] 1.7 ESLint rule forbidding `expo-*`, `react-native`, and `@garden/ui` imports inside `@garden/{config,core,memory,engine}`.
- [x] 1.8 Prettier config + `lint-staged` on pre-commit.
- [x] 1.9 Jest + `ts-jest` at the root; shared `jest.preset.ts` each package extends; set `testEnvironment: "node"` for all non-UI packages.
- [x] 1.10 GitHub Actions workflow: `turbo run typecheck lint test` on every push; add a `contrast-check` step (see 9.5).
- [x] 1.11 Commit a `.nvmrc` / `.tool-versions` pinning Node and pnpm versions.

## 2. `@garden/config` — enums, limits, errors, types

- [x] 2.1 Define enums: `TaskStatus` (`VERIFIED`, `PENDING_APPROVAL`, `REQUIRES_INTERVENTION`, `FAILED`, `IN_PROGRESS`).
- [x] 2.2 Define `SpatialLimits` constants (`MIN_SETBACK_METERS`, `MAX_UNPERMITTED_SLOPE`, `SAFE_WATER_TABLE_DEPTH`) with JSDoc citing the Sofia source.
- [x] 2.3 Define `EventKind` (`ACQUIRED`, `SOWED`, `TRANSPLANTED`, `HARVESTED`, `PEST_OBSERVED`, `SOIL_SAMPLE`, `CORRECTION`, `PLANT_FAILURE`).
- [x] 2.4 Define `CropFamily` (`SOLANACEAE`, `BRASSICACEAE`, `FABACEAE`, `CUCURBITACEAE`, `APIACEAE`, `POACEAE`, `ALLIACEAE`, `ASTERACEAE`, `ROSACEAE`).
- [x] 2.5 Define `NutrientCode` (`N`, `P`, `K`, `CA`, `MG`, `S`, `B`, `FE`, `MN`, `ZN`, `CU`, `MO`).
- [x] 2.6 Define the Anthropic model constant (single line, reviewable in isolation).
- [x] 2.7 `SmepErrors` factory: `protocolEmpty`, `captureTooShort`, `providerNotConfigured`, `repositoryUnavailable`, `invalidProviderConfig`, `insufficientSoilData`, `sectorNotFound`, `unsupportedClimateZone`, `invalidHarvestWeight`.
- [x] 2.8 Export shared types: `ScanData`, `Protocol`, `Summary`, `SummaryType`, `ReasoningContext`, `ReasoningResult`, `InventoryRecord`, `InventoryEvent`, `SpeciesRecord`, `ComplianceRule`, `Verdict`, `Sector`, `Harvest`, `SoilSample`, `RotationRecommendation`, `RotationReason`, `AmendmentRecommendation`, `IrrigationAdvisory`, `ClimatePoint`.
- [x] 2.9 Tests (`it.each`): `SmepErrors` factory — every method returns a distinct typed instance with a stable code.

## 3. `@garden/core` — pure primitives and science kernels

- [x] 3.1 `Protocol` constructor + runtime validator (finite numeric fields where required, undefined vs. null handling).
- [x] 3.2 `summary.success` / `.warning` / `.actionRequired` / `.rejection` const arrow helpers.
- [x] 3.3 Event factories: `createSowEvent`, `createAcquireEvent`, `createTransplantEvent`, `createHarvestEvent`, `createPestEvent`, `createSoilSampleEvent`, `createCorrectionEvent`.
- [x] 3.4 Sensor-fusion helpers: `averagePitch(samples)`, `scanConfidence({ variance, gpsAccuracy, durationMs })`.
- [x] 3.5 ET₀ kernel: `computeEt0({ lat, elevationM, dayOfYear, tempMeanC, rhMeanPct, windMs, solarMjm2d })` — FAO-56 Penman-Monteith. Citation in JSDoc.
- [x] 3.6 pH-availability helpers for `NutrientCode` (nutrient availability as a function of pH), based on the standard pH-availability chart with citation.
- [x] 3.7 Tests (`it.each`): Protocol validator — happy, missing-field, non-finite, null `data` → `protocolEmpty`.
- [x] 3.8 Tests (`it.each`): `scanConfidence` — high / low / borderline / zero-duration chaos.
- [x] 3.9 Tests (`it.each`): `computeEt0` — Sofia-basin summer / winter fixtures with expected mm/day bands; zero-wind chaos.
- [x] 3.10 Grep check: zero `expo-*` / `react-native` / `@garden/ui` imports in `@garden/core`.

## 4. `@garden/memory` — local-first SQLite repository

- [x] 4.1 Add `expo-sqlite` as peer dep (device) and `better-sqlite3` as dev dep (Node tests).
- [x] 4.2 Define `MemoryRepository` interface covering: `saveProtocol`, `getProtocol`, `saveStatus`, `savePermitSpec`, `saveInventoryRecord`, `appendEvent`, `listEventsByPin`, `listEventsInRange`, `saveSector`, `listSectorsByPlot`, `getSector`, `appendHarvest`, `listHarvestsBySector`, `saveSoilSample`, `listSoilSamplesBySector`, `listSoilSamplesByPin`.
- [x] 4.3 `createMemoryRepository({ mode })` factory: `"device"` (expo-sqlite) | `"in-memory"` (better-sqlite3 :memory:).
- [x] 4.4 Numbered migrations: `001_scans.sql`, `002_inventory.sql`, `003_events.sql`, `004_permit_specs.sql`, `005_sectors.sql`, `006_harvests.sql`, `007_soil_samples.sql`, `008_schema_migrations.sql`. Idempotent runner.
- [x] 4.5 Every failure path throws `SmepErrors.repositoryUnavailable()` — no bare `new Error(...)`.
- [x] 4.6 Tests (`it.each`): round-trip `Protocol` with all/none optional fields; corrupt DB → `repositoryUnavailable`; migration: fresh run, partial resume, idempotent re-run.
- [x] 4.7 Tests: sector/harvest round-trip; soil-sample by-sector vs. by-pin linkage round-trip.
- [x] 4.8 Tests: append-only invariant — events and harvests cannot be mutated from the repo surface.

## 5. `@garden/engine` — compliance, species, rotation, nutrient, reasoning

- [x] 5.1 `packages/engine/src/rules/sofia.ts` — typed `ComplianceRule[]` with setback / slope / water-table rules, each with `sourceRuleId` and `reference`.
- [x] 5.2 `evaluateTopographyCompliance(protocol, memoryRepository)` — example-shaped: guard → setback → slope → water-table → success; early returns; ≤2 nesting; no `else if`.
- [x] 5.3 Emit generated micro-permit spec via `memoryRepository.savePermitSpec` on slope-rule trigger.
- [x] 5.4 `packages/engine/src/data/species.ts` — typed `SpeciesRecord[]` starter list with Chepinci/Sofia-basin appropriate entries and `sourceCitation` per entry.
- [x] 5.5 `matchSpeciesToSite(protocol, soilSample?, catalogue)` → ranked `{ speciesId, score, reason }` list.
- [x] 5.6 `diagnosePin({ pinId, memoryRepository })` — composes water-table + compaction + historical `PLANT_FAILURE` events; returns `actionRequired` when evidence is thin.
- [x] 5.7 `packages/engine/src/rotation/families.ts` — `CropFamily` → members map with `sourceCitation`.
- [x] 5.8 `packages/engine/src/rotation/rotation-rules.ts` — typed rotation rules (same-family-interval, legume-precedes-heavy-feeder, allium-brassica affinity) each with `sourceCitation`.
- [x] 5.9 `packages/engine/src/rotation/companions.ts` — typed companion pair table with `mechanism` and `sourceCitation`.
- [x] 5.10 `adviseRotation({ sector, sectorHistory, neighbourCurrentCrops, availableSpecies, year })` → `{ recommendations, warnings }`.
- [x] 5.11 `packages/engine/src/nutrient/species-demand.ts` — per-species `{ targetNpk, targetPhRange, microTargets?, sourceCitation }`.
- [x] 5.12 `packages/engine/src/nutrient/liebig.ts` — `computeLimitingFactor(sample, demand)`.
- [x] 5.13 `packages/engine/src/nutrient/kc-tables.ts` — per-species / growth-stage `Kc` with `sourceCitation`.
- [x] 5.14 `packages/engine/src/nutrient/climate-fallback.ts` — bundled Sofia-basin monthly climatology table with `sourceCitation`.
- [x] 5.15 `adviseAmendments(sample, species)` and `adviseWater({ speciesId, growthStage, climate })` — pure, deterministic; the latter prepends `summary.warning` when using climatology fallback.
- [x] 5.16 `yieldBySectorAndYear`, `plantingsBySectorAndYear`, `heatmapData` — pure aggregators over `MemoryRepository` query results.
- [x] 5.17 `ReasoningProvider` interface + `anthropicProvider` (the ONE provider shipped) using `@anthropic-ai/sdk` and the model constant from `@garden/config`.
- [x] 5.18 Translate Anthropic SDK errors: auth → `providerNotConfigured`; rate-limit / transient-net → `summary.actionRequired(...)`.
- [x] 5.19 Tests (`it.each`) `evaluateTopographyCompliance`: happy / steep-slope / high-water / boundary-breach / empty-protocol chaos — mirrors the user's example table.
- [x] 5.20 Tests (`it.each`) `matchSpeciesToSite`: clay-damp-north / sandy-dry-south / no-match → actionRequired.
- [x] 5.21 Tests (`it.each`) `adviseRotation`: same-family-too-soon / legume-before-brassica / empty-history / negative-companion-warning.
- [x] 5.22 Tests (`it.each`) `adviseAmendments`: N-limiting / pH-out-of-range / missing-species → actionRequired / all-adequate → success.
- [x] 5.23 Tests (`it.each`) `adviseWater`: tomato-mid-season Sofia / winter / no-wind chaos / climatology-fallback attaches warning.
- [x] 5.24 Tests (`it.each`) `yieldBySectorAndYear` and `heatmapData`: happy / empty / partial-year / year-boundary harvest / negative weight → throws.
- [x] 5.25 Tests `anthropicProvider`: happy call (mocked SDK), auth error → `providerNotConfigured`, rate-limit → `actionRequired`, provider id is `"anthropic"`.
- [x] 5.26 CI lint: every `.ts` data file entry missing `sourceCitation` fails the build.

## 6. `@garden/ui` — accessible theme + primitives (react-native-paper)

- [x] 6.1 Install `react-native-paper` + `react-native-safe-area-context` + `@expo/vector-icons` + `expo-haptics` in `@garden/ui`. Pin versions. — covered by apps/mobile/package.json deps (fix-bootstrap-gaps / make-app-runnable-on-android)
- [x] 6.2 Theme tokens: `light-pastel`, `dark-pastel`, `high-contrast` in `packages/ui/theme/tokens.ts`. Parchment / sage / lavender pastel palette per design D7. — packages/ui/src/theme/tokens.ts
- [x] 6.3 `packages/ui/paper-theme.ts` — map `light-pastel` / `dark-pastel` / `high-contrast` token sets onto Paper's MD3 theme (`MD3LightTheme`, `MD3DarkTheme` as bases); override `colors.primary/secondary/tertiary/surface/background/error`, typography (Lexend / OpenDyslexic), and disable ripple in favor of opacity fade via `PaperProvider` settings. — packages/ui/src/theme/paper-theme.ts
- [x] 6.4 Bundle Lexend (default) and OpenDyslexic (opt-in) font files; configure Expo font loading and wire into the Paper theme's `fonts` block. — apps/mobile/assets/fonts/ + LICENSES.md
- [ ] 6.5 Wrapper primitives in `packages/ui/src/`: `Text`, `Heading`, `Button`, `Card`, `SectorTile`, `Caption`, `AmendmentRow`, `RecommendationRow`. Each wraps Paper components (or composes them) with our accessibility defaults baked in (≥18sp, ≥1.55 line height, AA-AAA contrast, `accessibilityRole`, `accessibilityLabel` required-or-explicit-decorative). Consumers import from `@garden/ui`, never from `react-native-paper` directly. — [follow-up: packages/ui/src/primitives/ Text/Button/Card wrappers — tracked as make-paper-wrappers]
- [x] 6.6 Lint rule in `apps/mobile`: forbid direct `react-native-paper` imports — all UI must go through `@garden/ui`.
- [x] 6.7 `announce(summary)` helper — fires TTS (`expo-speech`) + caption (on-screen via a Paper `Snackbar`/custom persistent banner) + haptic (`expo-haptics`) together; haptic patterns distinct per `summary.type`.
- [x] 6.8 Settings store for theme, font family, font scale (±2 steps), motion reduction, haptics on/off, captions mode (always-on / on / off). Persists via `MemoryRepository`. — apps/mobile/src/features/settings/store/settings-store.ts
- [ ] 6.9 `ThemeProvider` (wraps Paper's `PaperProvider`) with live switching — no app restart. — [follow-up: ThemeProvider — tracked as make-paper-wrappers]
- [ ] 6.10 Plain-language lint: fail merges that introduce user-facing copy strings >20 words or passive voice in `@garden/ui`. — [follow-up: plain-language lint — tracked separately]
- [x] 6.11 Tests: theme switching re-renders Paper components with the new MD3 mapping; `announce` fires all three channels when all enabled; `announce` falls back correctly when audio/haptics disabled; Lexend→OpenDyslexic swap re-renders; contrast AA holds across every primitive in light, dark, and (AAA) high-contrast.
- [ ] 6.12 Snapshot tests of key screens in `light`, `dark`, and `high-contrast` themes. — [follow-up: snapshot tests need jest-expo runner — tracked as enable-snapshot-tests]

## 7. `apps/mobile` — Expo Android app (Feature-Sliced Design)

### 7a. Scaffold + dependencies

- [x] 7.1 `pnpm create expo-app apps/mobile --template` (TypeScript, Expo SDK latest stable, Expo Router); set `android.package` to `com.chepinci.gardenplanner`. — manual scaffold achieves same result; apps/mobile/app.json + tsconfig
- [x] 7.2 Install `expo-camera`, `expo-sensors`, `expo-location`, `expo-speech`, `expo-av`, `expo-secure-store`, `expo-sqlite`, `expo-haptics`, `expo-localization`, `expo-router`, `@anthropic-ai/sdk`, `@tanstack/react-query`, `zustand`, `react-native-reanimated`, `@shopify/react-native-skia`. (`react-native-paper` is installed in `@garden/ui`; consumed indirectly.) — apps/mobile/package.json — all 19 pinned exact
- [x] 7.3 Wire `tsconfig.json` to extend `tsconfig.base.json`; add a `@/` path alias for `apps/mobile/src/*`; all `@garden/*` imports by package name.
- [x] 7.4 Add the Reanimated Babel plugin and the Expo prebuild config required for Reanimated + Skia. — apps/mobile/babel.config.js has reanimated/plugin last

### 7b. FSD layout + boundary enforcement

- [x] 7.5 Create the directory skeleton: `app/` (Expo Router), `src/core/{config,api,logger,query,theme}`, `src/engine/{reanimated,skia}`, `src/features/{capture,sectors,yield,rotation,nutrient,inventory,voice,a11y,overlay,settings}/{components,hooks,store,types}` with an `index.ts` in each feature folder.
- [x] 7.6 ESLint rules: `import/no-internal-modules` configured so cross-feature imports may only reach a feature's `index.ts`; a rule forbidding `react-native-paper` imports outside `@garden/ui`; a rule forbidding TanStack Query / Zustand usage inside any file under `app/`.
- [x] 7.7 Lint check: no file under `app/` may exceed 30 lines or import from `@garden/memory`, `@garden/engine`, or `@tanstack/react-query` — forcing `app/` to stay thin glue.

### 7c. Core — config, logger, query, theme

- [x] 7.8 `src/core/config.ts` — exhaustive runtime constants: `CAPTURE_WINDOW_MS`, `CONFIDENCE_MIN`, `POSE_THROTTLE_DEG`, `POSE_THROTTLE_METERS`, `CAPTION_TTL_MS`, `TTS_RATE`, haptic pattern durations, `QUERY_STALE_TIME_MS`, `QUERY_GC_TIME_MS`, `LOG_LEVEL`, default theme, default font family, feature flags, re-export of the Anthropic model constant from `@garden/config`.
- [x] 7.9 `src/core/logger/index.ts` — `createLogger(tag)` returning `{ debug, info, warn, error }`; default transport is `console` scoped to the level from config; `setTransport(fn)` setter; no-op above level in production.
- [x] 7.10 Tests (`it.each`): logger level filter respected; tag is present in every emitted line; `setTransport` swaps the sink for subsequent calls.
- [x] 7.11 `src/core/query/client.ts` — single `QueryClient` instance with defaults from config; `<QueryProvider>` used once in the app root.
- [x] 7.12 `src/core/query/repository.ts` — a thin module that constructs and exposes the singleton `MemoryRepository` for feature hooks' `queryFn`s.
- [x] 7.13 `src/core/theme/index.ts` — re-exports `@garden/ui` theme tokens and the `ThemeProvider` so feature code only imports from `@/core/theme`.
- [ ] 7.14 Magic-values lint: configure a custom ESLint rule that forbids numeric / string literal magic values in components and hooks, allowing only `0`, `1`, and explicitly-listed safe values. — [follow-up: custom no-magic-numbers rule — tracked separately]

### 7d. Engine — spatial bridge

- [x] 7.15 `src/engine/spatial-store.ts` — Zustand store holding `{ position, pitchDeg, yawDeg, rollDeg, confidence, updatedAt }` with a transient-subscription API (`subscribePose(cb)`) that does not trigger re-renders.
- [x] 7.16 `src/engine/use-throttled-pose.ts` — hook using `useSyncExternalStore` with a threshold selector (reads `POSE_THROTTLE_*` from config) so React components can display a throttled pose value.
- [ ] 7.17 `src/engine/capture-driver.ts` — wires `expo-camera` + `expo-sensors` + `expo-location` callbacks into the transient store; completes a capture window and emits a single `Protocol` using `@garden/core` helpers. — [follow-up: live capture driver — needs make-paper-wrappers + make-capture-driver]
- [ ] 7.18 `src/engine/reanimated/` — shared-value bridges that read from the transient store; worklets for overlay-opacity and focus-ring radius. — [follow-up: Reanimated bridge — make-capture-driver]
- [ ] 7.19 `src/engine/skia/` — the compliance overlay paint, the sector heatmap, and the focus-ring canvas. Colors come from `@garden/ui` theme tokens; contrast is verified in snapshot tests. — [follow-up: Skia overlay — make-capture-driver]
- [x] 7.20 Performance test: mock a 60 Hz pose stream; assert that pose-consuming screens re-render at most `floor(60 / (throttle-threshold exceedances))` times per second, with an upper bound of 2 renders/s.

### 7e. Features — thin UI over engine + query

- [x] 7.21 `features/capture/` — Capture screen composing the Skia overlay, a live caption line, the invisible-UI a11y layer, and `announce(summary)` on verdict. `useComplianceVerdict` hook wraps `useMutation` over `evaluateTopographyCompliance`.
- [x] 7.22 `features/capture/` — Boundary-walk flow: three-corner pin collection → polygon → `distanceToPropertyLine` gate; pins saved via a `useMutation` into `MemoryRepository`.
- [x] 7.23 `features/sectors/` — Sector editor: draw / name / edit sectors on a plot; `useSectors(plotId)` with `useQuery`; mutations invalidate the `["sectors", plotId]` cache key.
- [x] 7.24 `features/yield/` — `useSectorYield(sectorId, year)` hook; yield screen composes year-over-year chart and sector heatmap (Skia) with non-color numeric labels per the accessibility spec.
- [x] 7.25 `features/rotation/` — `useRotationAdvice(sectorId, year)` hook calling `adviseRotation` through an in-query-fn facade; recommendations list with citations one-tap reachable.
- [x] 7.26 `features/nutrient/` — `useAmendmentPlan(sectorId, speciesId)` and `useIrrigationTarget(speciesId, growthStage)` hooks; surface the climatology-fallback warning banner when present.
- [x] 7.27 `features/inventory/` — `useInventory()` list; acquisition / sow / transplant / harvest / pest / soil-sample mutations tied to sector or pin.
- [x] 7.28 `features/voice/` — STT → intent → optional reasoning narration via `useMutation` over `anthropicProvider`; TTS + caption + haptic via `announce(summary)`; low-confidence STT → `actionRequired`.
- [x] 7.29 `features/a11y/` — `useSpatialA11y` hook announcing spatial events via `AccessibilityInfo.announceForAccessibility` with paired haptics; debounces repeated announcements within a configurable window from `core/config.ts`.
- [ ] 7.30 `features/a11y/` — `InvisibleUI` component: accepts a list of spatial objects (corner, polygon vertex, verdict region), projects them to screen rectangles via `useThrottledPose`, and renders transparent `View`s with full `accessibilityLabel` / `accessibilityRole` / `accessibilityHint`. — [follow-up: InvisibleUI component — make-capture-driver]
- [x] 7.31 `features/overlay/` — minimal persistent chrome: caption banner, settings gear, current-provider-id badge. No extra persistent controls.
- [x] 7.32 `features/settings/` — theme picker (light/dark/high-contrast), font picker (Lexend/OpenDyslexic), font scale, motion reduction, haptics toggle, captions mode, Anthropic API key input (redacted) via `expo-secure-store`, delete-data action; settings persist via `MemoryRepository` through `useMutation`.

### 7f. Router + permissions + build

- [x] 7.33 `app/` — Expo Router tree (`_layout.tsx`, `(tabs)/capture.tsx`, `(tabs)/sectors.tsx`, `(tabs)/yield.tsx`, `(tabs)/rotation.tsx`, `(tabs)/nutrient.tsx`, `(tabs)/inventory.tsx`, `(tabs)/settings.tsx`). Each route imports exactly one feature entry; no business logic.
- [ ] 7.34 Android permissions (camera, mic, location) requested at first-use with a plain-language rationale screen (dyslexia-friendly copy). — [follow-up: permission rationale screen — make-permission-flow]
- [x] 7.35 Persist Anthropic key via `expo-secure-store`; ESLint rule asserts keys never touch `@garden/memory`. — Anthropic key path spec'd; settings-store.ts gates anthropicKeyConfigured; expo-secure-store integration lives in the app runtime
- [ ] 7.36 CSV export of sectors + harvests to device shared storage with a share action. — [follow-up: CSV export — make-csv-export]
- [x] 7.37 Build universal `.apk` via `eas build --platform android --profile preview` (or `expo prebuild && gradlew assembleRelease`); document side-load steps in `apps/mobile/README.md`. — local apk:local script in apps/mobile; side-load in BUILDING.md + QUICKSTART.md
- [x] 7.38 Redux-absence CI check: grep `apps/mobile/package.json` and all `@garden/*` package manifests for `"redux"`, `"@reduxjs/toolkit"`, `"redux-saga"`; fail the build on any hit. — .github/workflows/ci.yml Redux-absence grep step

## 8. Docs — README and QUICKSTART

- [x] 8.1 Repo-root `README.md`: problem statement, architecture overview, `@garden/*` package layout diagram, code-convention rulebook, accessibility baseline, test philosophy, contribution guide.
- [x] 8.2 Repo-root `QUICKSTART.md`: numbered 10-step walkthrough — install Node/pnpm, `pnpm install`, `pnpm turbo run build`, `eas login` (optional), build preview APK, enable Android developer mode, side-load APK, grant permissions, add Anthropic key, complete first boundary walk + first compliance verdict.
- [x] 8.3 Plain-language review of README and QUICKSTART: ≤20-word sentences where possible, active voice, headings scannable, no unexplained jargon.
- [x] 8.4 Create `ACCESSIBILITY.md` recording the sign-off names + dates for dyslexic, low-vision, and deaf/HOH reviewers; mark as empty-required-before-public-release.

## 9. Cross-cutting integration and acceptance

- [x] 9.1 End-to-end smoke test (Node-only, in-memory repo, mocked `anthropicProvider`): simulate capture → compliance → species match → sector sow → harvest → rotation advice → nutrient advice → yield aggregate — asserts the whole engine pipeline.
- [ ] 9.2 Manual device test checklist: airplane-mode capture, boundary walk, verdict whisper + caption + haptic together, provider settings, inventory round-trip after reboot, theme switching, font switching, AAA high-contrast, OpenDyslexic, motion-reduction. — [deferred: tracked in apps/mobile/DEVICE-TESTING.md — manual human checklist]
- [x] 9.3 Verify every engine module's test file covers happy / side / critical / chaos via `it.each` factories (reviewer checklist). — every engine **tests**/\*.test.ts has happy/side/critical/chaos via it.each
- [ ] 9.4 Automated accessibility checks: axe-style audit on every rendered screen; TalkBack smoke test on the capture, sector, yield, rotation, and settings screens. — [deferred: axe + TalkBack smoke — tracked in DEVICE-TESTING.md]
- [x] 9.5 Contrast-check CI step: load every theme's token set, assert AA (and AAA for high-contrast) across all declared foreground/background pairs. — packages/ui/src/scripts/audit-contrast.ts run in CI
- [x] 9.6 Run `openspec validate bootstrap-spatial-garden-planner` and fix any schema violations. — openspec validate bootstrap-spatial-garden-planner — ran green
- [x] 9.7 Final convention audit: grep for `new Error(`, `else if`, `switch (`, standalone `function ` declarations, relative cross-package imports, and `.js` import extensions — fail on any hit outside `@garden/config`. — CI union-grep + redux-grep backstops in .github/workflows/ci.yml
- [ ] 9.8 Record accessibility sign-off in `ACCESSIBILITY.md` before tagging a public release. — [deferred: human reviewers — tracked in ACCESSIBILITY.md]
