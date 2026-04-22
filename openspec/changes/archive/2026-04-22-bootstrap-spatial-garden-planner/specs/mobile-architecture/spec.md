## ADDED Requirements

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
