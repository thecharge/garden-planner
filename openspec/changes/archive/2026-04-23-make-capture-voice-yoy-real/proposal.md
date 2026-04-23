## Why

The app as shipped today is a competent CRUD shell with aspirational
marketing. The README says "pan the camera, get a Protocol" — the Viewfinder
is a dashed `<View>` and **Scan** fabricates a hardcoded Protocol.
It says "Voice-first, always-captioned" — no feature calls `announce()` and no
device channel is wired. The Yield tab says "Year-over-year yield" — it shows
a single-year list. `docs/STATUS.md` inventories every gap with `file:line`
evidence.

Users sideloading the APK hit a viewfinder that doesn't film, a voice system
that doesn't talk, a heatmap that isn't one, and a YoY tab that isn't one.
The vision doesn't ship; the code knows it doesn't ship but the docs pretend
otherwise.

This change closes the gap between what the README claims and what the APK
does. It keeps the pure packages untouched, adds the three missing device
channels (camera / sensors + location, speech + haptics, file + sharing),
and rebuilds the Yield tab around the engine that has worked from day one.

## What Changes

- **Real capture pipeline.** Build `apps/mobile/src/engine/capture-driver.ts`
  using `expo-camera` (preview + permission), `expo-sensors` DeviceMotion
  (2 s pitch/roll window), `expo-location` (lat/lon cached per plot). Emits
  a real `Protocol` — no more hardcoded `distanceToPropertyLine: 5`.
- **Permissions rationale route.** New `app/capture/permissions.tsx` screen
  that explains _why_ camera + location + motion are requested, with a
  single "Grant access" button. Scan tab routes here if any permission is
  missing; Scan button shows `summary.actionRequired(...)` meanwhile.
- **Device channels for `announce()`.** New
  `apps/mobile/src/core/announce/` with concrete `tts`
  (`expo-speech.speak`), `haptic` (`expo-haptics.notificationAsync`), and
  `caption` (Zustand caption store + sticky bar in the root layout)
  implementations wired into `announce()`'s `AnnounceChannels`. Every
  mutation in capture/sectors/yield/inventory/settings calls `announce()`
  on success and on typed failure.
- **Real YoY Yield tab.** Replace the flat list with a two-column comparison
  (current year vs the prior year) per sector+species, plus a heatmap-style
  color intensity per row using the existing pastel pair. Engine stays
  untouched.
- **CSV export.** New `export-csv-button.tsx` using `expo-file-system` +
  `expo-sharing` writes `sectorId,sectorName,year,speciesId,totalWeightGrams,harvestCount`.
- **Splash-screen handshake.** Root `_layout.tsx` wires
  `SplashScreen.preventAutoHideAsync` + `hideAsync` on first paint so the
  cold boot no longer looks stuck.

Out of scope (explicitly, and labelled on the roadmap):

- Speech-to-text — needs Vosk integration; tracked in
  `make-voice-stt-real`.
- Skia overlay + Reanimated worklet — tracked in
  `make-spatial-overlay-real`.
- Device SQLite — tracked in `make-device-sqlite-adapter`.
- Native BG translations — needs a named reviewer in `ACCESSIBILITY.md`.

## Capabilities

### New Capabilities

- `voice-output`: the device-level wiring of `announce()` channels
  (TTS via `expo-speech`, haptics via `expo-haptics`, caption via a
  Zustand store + a sticky caption bar in the root layout). Does **not**
  cover STT.

### Modified Capabilities

- `spatial-topography`: add requirement — Scan MUST produce a real
  `Protocol` derived from `expo-camera` + `expo-sensors` + `expo-location`,
  and MUST be gated behind a permissions rationale route. Remove the
  hardcoded placeholder.
- `yield-tracking`: add requirements — the Yield tab MUST render a
  two-column YoY comparison; MUST expose a CSV export action; MUST render
  sector rows with a yield-proportional pastel tint (heatmap hint).
- `mobile-architecture`: add requirements — root layout MUST manage the
  splash screen; a sticky caption bar MUST be mounted at the root so every
  `announce()` call produces a visible, persistent subtitle regardless of
  which feature screen fired it; every mutation MUST announce its outcome.

## Impact

- **New files**
  - `apps/mobile/src/engine/capture-driver.ts`
  - `apps/mobile/src/engine/__tests__/capture-driver.test.ts`
  - `apps/mobile/src/core/announce/{announce-provider,tts,haptic,caption-store,caption-bar,index}.tsx`
  - `apps/mobile/src/core/announce/__tests__/{announce-provider,caption-store}.test.tsx`
  - `apps/mobile/app/capture/permissions.tsx`
  - `apps/mobile/src/features/capture/hooks/use-capture-permissions.ts`
  - `apps/mobile/src/features/yield/components/{yoy-table,export-csv-button}.tsx`
  - `apps/mobile/src/features/yield/hooks/use-yoy.ts`
  - `apps/mobile/src/features/yield/__tests__/{yoy-table,export-csv-button}.test.tsx`
  - `packages/engine/src/aggregation/__tests__/yoy.test.ts`
  - `docs/STATUS.md` (already written, part of this scope)

- **Files modified**
  - `apps/mobile/app/_layout.tsx` — splash handshake + `AnnounceProvider` + `<CaptionBar />`
  - `apps/mobile/src/features/capture/components/capture-screen.tsx` — use driver, kill hardcoded Protocol, announce on every verdict
  - `apps/mobile/src/features/yield/components/yield-screen.tsx` — replace list with `<YoYTable />` + `<ExportCsvButton />`
  - `apps/mobile/src/features/sectors/components/{sectors-screen,sector-detail-screen}.tsx` — announce on save/rename/delete/harvest
  - `apps/mobile/src/features/inventory/components/{record-form,event-form}.tsx` — announce on submit
  - `apps/mobile/src/features/settings/components/anthropic-key-field.tsx` — announce on save/clear
  - `apps/mobile/src/core/config.ts` — `CAPTURE_WINDOW_MS`, `CAPTION_TTL_MS`, `CAPTURE_LOCATION_CACHE_MS`
  - `packages/engine/src/aggregation/yield.ts` — add `yoyBySectorAndSpecies(repo, plotId, year)` pure helper
  - `apps/mobile/package.json` — confirm `expo-file-system` + `expo-sharing` pinned
  - `README.md` — already updated; ensure STATUS link stays
  - `HOW-TO.md`, `docs/app-flow.md` — ambient updates once features land

- **Dependencies**: `expo-camera`, `expo-sensors`, `expo-location`, `expo-speech`, `expo-haptics`, `expo-file-system`, `expo-sharing` — all already in `package.json`. No new installs.
- **CI**: coverage reports will update; no new gates.
