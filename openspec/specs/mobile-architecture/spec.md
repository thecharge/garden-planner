# mobile-architecture Specification

## Purpose

TBD - created by archiving change bootstrap-spatial-garden-planner. Update Purpose after archive.

## Requirements

### Requirement: Feature-Sliced Design internal layout

The `apps/mobile` app SHALL be organised by feature, not by file type. The top-level layout MUST be:

- `app/` — Expo Router screens, containing near-zero business logic (navigation glue only).
- `src/core/` — globally shared pieces (`config.ts`, `api/`, `logger/`, `query/`, `theme/`).
- `src/engine/` — the spatial bridge (transient store, capture driver, Reanimated worklets, Skia overlays).
- `src/features/<feature>/` — self-contained feature silos with `components/`, `hooks/`, `store/`, `types/`.

A feature silo MUST be deletable without breaking the rest of the app (beyond the missing route).

#### Scenario: Feature deletion leaves the rest compilable

- **WHEN** the entire `src/features/rotation/` directory is deleted and its route entry in `app/` is removed
- **THEN** the project MUST typecheck and build successfully
- **AND** every remaining feature MUST render unchanged

#### Scenario: Expo Router files carry no business logic

- **WHEN** a reviewer inspects any file under `app/`
- **THEN** the file MUST only import and compose feature entry points; it MUST NOT contain TanStack Query calls, Zustand store definitions, or direct engine invocations
- **AND** a lint rule MUST fail the build on violation

### Requirement: Feature boundary enforcement

The system SHALL enforce feature boundaries: a feature MAY only import from `@/core/`, `@/engine/`, `@garden/*` packages, or from another feature's `index.ts` public surface. Importing a non-exported internal file of another feature MUST fail a lint rule.

#### Scenario: Cross-feature deep import fails lint

- **WHEN** a file under `src/features/rotation/` imports from `src/features/yield/hooks/use-sector-yield.ts` directly
- **THEN** the `import/no-internal-modules` (or equivalent) rule MUST fail the build
- **AND** the correct usage MUST be to import from `src/features/yield` (its `index.ts`)

### Requirement: State discipline — TanStack Query + Zustand, no Redux

The system SHALL use **TanStack Query** for all reads and writes that pass through `MemoryRepository` or `ReasoningProvider`, and **Zustand** for client UI state. Redux (and Redux Toolkit) MUST NOT be added as a dependency.

#### Scenario: MemoryRepository read goes through TanStack Query

- **WHEN** a feature needs year-over-year yield for a sector
- **THEN** it MUST expose a hook (e.g., `useSectorYield`) that wraps `useQuery` with a `queryFn` calling the pure aggregator from `@garden/engine`
- **AND** the component MUST read `{ data, isLoading, isError }` from the hook, not manage its own loading state

#### Scenario: Anthropic call goes through TanStack Query mutation

- **WHEN** a feature triggers a reasoning-backed narration
- **THEN** it MUST use `useMutation` with the `anthropicProvider` call as the mutation function
- **AND** the `onError` path MUST surface the error via the `announce(summary.actionRequired(...))` cross-modal helper

#### Scenario: Redux not installed

- **WHEN** CI inspects `package.json` in `apps/mobile` and any `@garden/*` package
- **THEN** neither `redux`, `@reduxjs/toolkit`, nor `redux-saga` MUST be listed as dependencies or devDependencies

### Requirement: 60 Hz spatial pose bypasses React render cycle

The system SHALL hold live spatial pose data (position, pitch, yaw, roll, sampled at up to 60 Hz) in a Zustand store updated via transient updates, or in a `useRef`. The pose MUST NOT be held in `useState` or in a TanStack Query cache. Components that need to _display_ a spatial value MUST throttle updates by a configurable threshold from `core/config.ts`.

#### Scenario: 60 Hz pose does not trigger component re-renders

- **WHEN** the spatial store receives 60 pose updates per second
- **THEN** components that do not subscribe to a thresholded selector MUST NOT re-render
- **AND** a performance test MUST verify under 2 renders per second on a pose-consuming screen during steady 60 Hz input

#### Scenario: Batched snapshot is the React-visible artifact

- **WHEN** the capture driver completes a capture window
- **THEN** it MUST emit a single `Protocol` snapshot via the standard React path
- **AND** the live pose during the window MUST remain outside React state

### Requirement: Native-thread rendering via Reanimated + Skia

The system SHALL use `react-native-reanimated` for animations driven by spatial values and `@shopify/react-native-skia` for spatial overlays (capture viewport, sector heatmap, focus rings, compliance boundary). Spatial values MUST flow into Reanimated shared values from the transient store so the JS thread does not mediate each sample.

#### Scenario: Compliance overlay paint is on the UI thread

- **WHEN** the capture screen renders the green/red compliance overlay
- **THEN** the overlay MUST be rendered by Skia, not by standard React `View` components with `StyleSheet`
- **AND** its opacity/color changes in response to pose MUST be driven by Reanimated shared values

### Requirement: Centralised app runtime config — zero hardcoded values

The system SHALL centralise every app runtime constant (capture window ms, confidence thresholds, query `staleTime`/`gcTime`, TTS rate, caption TTL, haptic pattern durations, default theme, default font, log level, feature flags) in `apps/mobile/src/core/config.ts`. A lint rule MUST flag literal numbers or user-facing strings used as magic values in components and hooks.

`core/config.ts` is complementary to `@garden/config`: enums, cross-package types, and the error factory live in `@garden/config`; app-only runtime settings live in `core/config.ts`.

#### Scenario: Magic number in a component fails lint

- **WHEN** a reviewer adds `setTimeout(fn, 5000)` directly in a feature component
- **THEN** a `no-magic-numbers` (or custom) ESLint rule MUST fail the build
- **AND** the correct fix MUST be to import the named constant (e.g., `CAPTION_TTL_MS`) from `@/core/config`

#### Scenario: Single-line Anthropic model upgrade

- **WHEN** the team upgrades the default Claude model
- **THEN** the edit MUST be a single-line change to the constant in `@garden/config`
- **AND** `core/config.ts` MUST re-export that constant for app consumers

### Requirement: Hand-rolled thin logger with transport slot

The system SHALL ship a `createLogger(tag: string)` factory in `apps/mobile/src/core/logger/` returning `{ debug, info, warn, error }`. The logger MUST read its level filter from `core/config.ts`. It MUST expose a `setTransport(fn)` setter so a future sink (e.g., Sentry) can be plugged in without touching callers.

#### Scenario: Loggers are tag-scoped

- **WHEN** a feature creates `const log = createLogger("yield")`
- **THEN** every emitted line MUST include the tag `"yield"` in its output
- **AND** the tag MUST be filterable at the transport layer

#### Scenario: Production no-op above threshold

- **WHEN** the log level is configured to `"warn"` in production
- **THEN** `log.debug` and `log.info` calls MUST be no-ops and MUST NOT allocate strings or call `console.*`

#### Scenario: Transport swap at runtime

- **WHEN** the app calls `setTransport(myRemoteSink)` at startup
- **THEN** subsequent log calls MUST route through `myRemoteSink`
- **AND** existing `createLogger` consumers MUST NOT need any change

### Requirement: Feature-hook folder layout

Every feature folder under `src/features/` SHALL follow the same internal layout: `components/` (feature-specific UI), `hooks/` (TanStack Query + Zustand wrappers), `store/` (Zustand slices local to the feature), `types/` (TypeScript interfaces), and `index.ts` (public surface — the only import path other features may use).

#### Scenario: Feature has a public surface

- **WHEN** a feature folder is created
- **THEN** it MUST contain an `index.ts` that re-exports the hooks and components the rest of the app may consume
- **AND** cross-feature imports MUST go through `index.ts`

### Requirement: TanStack Query client is configured centrally

The system SHALL configure a single `QueryClient` in `src/core/query/`, exporting both the client and a `<QueryProvider>` component used once in the app root. Default options (`staleTime`, `gcTime`, `retry`, `refetchOnWindowFocus: false` for RN) MUST be read from `core/config.ts`.

#### Scenario: QueryClient exists once

- **WHEN** CI inspects the source for `new QueryClient(`
- **THEN** it MUST find exactly one occurrence, in `src/core/query/`

### Requirement: Root layout provider order

`apps/mobile/app/_layout.tsx` SHALL wrap the app tree in this exact provider order, outside → in: `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` (from `@garden/ui`, which hosts `PaperProvider` + exposes token context) → `QueryProvider`. The root layout file stays ≤30 lines per the existing `app/` thin-glue rule.

#### Scenario: Providers mount in the expected order

- **WHEN** `_layout.tsx` renders
- **THEN** the rendered tree MUST include each of the four providers in order
- **AND** no feature-level imports (e.g., `@garden/memory`, `@garden/engine`) MUST appear in `app/_layout.tsx`

### Requirement: Bottom-tab navigation via expo-router `Tabs`

The app SHALL use expo-router's `Tabs` layout at `apps/mobile/app/(tabs)/_layout.tsx` to expose the 7 feature screens (capture, sectors, yield, rotation, nutrient, inventory, settings). Tab labels and icons MUST come from the active theme's color tokens and from `@expo/vector-icons/Feather`.

#### Scenario: All 7 tabs are reachable

- **WHEN** the app launches to the Capture tab
- **THEN** the user MUST be able to reach each of the 7 feature screens by tapping its tab icon
- **AND** the active tab indicator MUST use `theme.colors.primary`

#### Scenario: No blank white flash on launch

- **WHEN** the app cold-starts
- **THEN** the splash screen MUST paint the theme's `background` color
- **AND** `SplashScreen.hideAsync()` MUST only fire once fonts and the initial theme are ready

### Requirement: Sector detail route outside the tabs group

The app SHALL expose a `/sector/[id]` route at `apps/mobile/app/sector/[id].tsx`. The route file MUST stay ≤30 lines and MUST render a single feature component imported from `@/features/sectors` (no business logic in `app/`). The route lives outside the `(tabs)` group so the bottom tab bar hides while on detail (standard RN UX) and a back-chevron returns the user to the Sectors tab list.

#### Scenario: Deep link from Sectors tab

- **WHEN** the user taps a sector row in the Sectors tab list
- **THEN** the app MUST navigate via `router.push('/sector/' + id)`
- **AND** the detail screen MUST render the sector's name as a `Heading`
- **AND** the tab bar MUST NOT be visible on the detail screen

#### Scenario: Invalid sector id

- **WHEN** the user opens `/sector/does-not-exist`
- **THEN** the detail screen MUST render a `Caption` variant `actionRequired` reading "Sector not found"
- **AND** a "Back to sectors" `Button` MUST be visible

### Requirement: Theme live-switch follows the settings store

Flipping the active theme in Settings SHALL re-render every mounted screen with the new token palette without a cold restart. The canonical wiring is a thin app-side component (e.g. `SettingsThemeProvider` in `apps/mobile/src/core/theme/`) that subscribes to `settingsStore.themeId` via a `zustand` React binding and passes the current id into `@garden/ui`'s `ThemeProvider` as its `themeId` prop. The root `app/_layout.tsx` MUST compose this wrapper so the app theme always follows the store. `@garden/ui`'s `ThemeProvider` MUST NOT take a runtime dependency on the mobile settings store.

#### Scenario: Theme flips live from Settings

- **GIVEN** the app is mounted with the default theme
- **WHEN** the user picks a different theme on the Settings screen
- **THEN** every mounted screen MUST re-render with the new token palette within one animation frame
- **AND** a cold restart MUST NOT be required

### Requirement: Single-command dev launcher

The repo SHALL expose a root `pnpm dev` script that boots the Android dev loop end-to-end from a clean shell, with no environment priming required from the user beyond having a configured JDK and Android SDK. The script at `scripts/dev.sh` MUST:

1. Source `scripts/setup-env.sh`.
2. Run `scripts/doctor.sh` and exit non-zero if any check fails.
3. If `adb devices` lists no online device, invoke `scripts/launch-emulator.sh` and wait for the AVD to boot.
4. Run `adb reverse tcp:8081 tcp:8081`.
5. If no Metro is listening on port 8081, start `expo start --dev-client --port 8081` in the background and wait until `http://localhost:8081/status` returns 200.
6. Re-run `adb reverse tcp:8081 tcp:8081` after Metro starts (adb reconnects reset the mapping).
7. Run `expo run:android --no-bundler` to install and launch the app.
8. Tail the Metro log in the foreground so the user sees hot-reload output. Ctrl+C MUST stop only the tail, not Metro.

A companion `pnpm dev:stop` script MUST kill any Metro process spawned by `dev.sh` and shut down the emulator.

#### Scenario: Fresh shell launches the app

- **GIVEN** a fresh terminal with no Metro running and no emulator booted
- **WHEN** the user runs `pnpm dev` from the repo root
- **THEN** the script MUST boot the emulator, start Metro, install the APK, and stream Metro logs
- **AND** no additional manual `adb reverse` or environment sourcing MUST be required

#### Scenario: Teardown is explicit

- **WHEN** the user runs `pnpm dev:stop`
- **THEN** Metro MUST be killed and the emulator MUST shut down cleanly
