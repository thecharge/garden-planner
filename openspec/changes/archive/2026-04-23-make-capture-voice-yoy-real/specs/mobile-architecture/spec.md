## ADDED Requirements

### Requirement: Root layout manages the splash screen handshake

The root `apps/mobile/app/_layout.tsx` SHALL call
`SplashScreen.preventAutoHideAsync()` at module load, gate its returned
JSX behind an "app ready" flag (fonts resolved, theme provider mounted,
query client instantiated), and call `SplashScreen.hideAsync()` in a
`useEffect` once the flag flips to `true`. The "app ready" flag MUST
time out to `true` after 2000 ms even if dependencies stall, so the user
never sees an indefinite splash.

#### Scenario: Splash hides on first paint once fonts resolve

- **GIVEN** the user cold-launches the app
- **WHEN** `useFonts` resolves
- **THEN** `SplashScreen.hideAsync` MUST be called within one render cycle of the resolution
- **AND** the first visible frame MUST be the Capture tab (or the last-focused tab)

#### Scenario: Splash hides on timeout even if a dependency stalls

- **GIVEN** `useFonts` has not resolved after 2000 ms
- **WHEN** the 2 s fallback timer fires
- **THEN** `SplashScreen.hideAsync` MUST still be called
- **AND** the app MUST render using the default theme tokens

### Requirement: AnnounceProvider mounts above every feature route

The root layout SHALL wrap every route group in an `AnnounceProvider`
from `apps/mobile/src/core/announce/`. The provider MUST be nested
_inside_ the `ThemeProvider` (so captions inherit the active palette)
but _outside_ the `Stack` (so a single caption store persists across
route changes).

#### Scenario: Caption persists across a route change

- **GIVEN** `announce(summary.success("Sector saved"))` fires on the Sectors tab
- **WHEN** the user navigates to the Yield tab before `CAPTION_TTL_MS` elapses
- **THEN** the caption MUST still be visible in the caption bar on the Yield tab
- **AND** the caption MUST auto-dismiss when its TTL expires

### Requirement: Caption bar renders at the root, not per-screen

A single `<CaptionBar />` instance SHALL mount in the root layout
beneath the tab bar. Feature screens MUST NOT render their own caption
bars — the root bar is the one source of truth.

#### Scenario: Only one caption bar exists in the render tree

- **WHEN** the render tree is inspected at runtime
- **THEN** exactly one `<CaptionBar />` MUST be present
- **AND** it MUST be a sibling-after of the tab/stack navigator, rendered in the same root layout

### Requirement: Every feature mutation wires announce()

Feature mutations MUST call `useAnnounce()` in `onSuccess` and in
`onError`, across every TanStack Query mutation in
`apps/mobile/src/features/{capture,sectors,yield,inventory,settings}/hooks/`.
The `onError` path MUST route through `SmepErrors.*` before announcing —
raw error objects MUST NOT be announced.

#### Scenario: Harvest mutation announces on both paths

- **GIVEN** the user taps Submit on the harvest form
- **WHEN** `appendHarvest` resolves successfully
- **THEN** `announce(summary.success(<message>))` MUST fire exactly once
- **AND** when `appendHarvest` rejects, `announce(summary.actionRequired(<plain-language>))` MUST fire exactly once
