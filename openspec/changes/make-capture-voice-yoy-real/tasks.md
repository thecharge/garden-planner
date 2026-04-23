## 1. Engine — pure, no native deps

- [x] 1.1 Add `yoyBySectorAndSpecies(repo, plotId, year)` to `packages/engine/src/aggregation/yield.ts` — returns `{ sectorId, speciesId, currentGrams, priorGrams, deltaGrams, deltaPct }[]` sorted by absolute delta desc
- [x] 1.2 Add `YoyRow` type to `@garden/engine` barrel export
- [x] 1.3 Add `packages/engine/src/__tests__/yoy.test.ts` — `it.each` for happy (both years present), side (new-this-year / gone-this-year), critical (same-year zero delta), chaos (non-finite weight)

## 2. Config + core primitives

- [x] 2.1 Add `CAPTURE_WINDOW_MS`, `CAPTURE_LOCATION_CACHE_MS`, `CAPTION_TTL_MS`, `TTS_TIMEOUT_MS` to `apps/mobile/src/core/config.ts`
- [x] 2.2 Add `voiceEnabled`, `captionsEnabled`, `hapticsEnabled` booleans to `settingsStore.ts` (default all `true`)

## 3. Announce — device channels

- [x] 3.1 Create `apps/mobile/src/core/announce/caption-store.ts` — Zustand store `{ caption: string | null, pushCaption(text, ttlMs) }` with a setTimeout auto-clear and a per-call replace
- [x] 3.2 Create `apps/mobile/src/core/announce/haptic.ts` — pure map `HapticPattern → Haptics.NotificationFeedbackType` with Light fallback
- [x] 3.3 Create `apps/mobile/src/core/announce/tts.ts` — thin wrapper over `Speech.speak` with 2 s timeout and language resolution
- [x] 3.4 Create `apps/mobile/src/core/announce/announce-provider.tsx` — context provider that memoises the `AnnounceChannels` object from the three primitives + the settings toggles
- [x] 3.5 Create `apps/mobile/src/core/announce/caption-bar.tsx` — reads from caption store, renders a `Caption` + muted timer bar, no caption = null render
- [x] 3.6 Create `apps/mobile/src/core/announce/index.ts` — exports `AnnounceProvider`, `CaptionBar`, `useAnnounce()`
- [x] 3.7 Create `apps/mobile/src/core/announce/__tests__/caption-store.test.ts` — auto-dismiss after TTL, replace on second push
- [ ] 3.8 Create `apps/mobile/src/core/announce/__tests__/announce-provider.test.tsx` — dispatches to tts/caption/haptic per settings flags

## 4. Splash handshake + provider wiring

- [x] 4.1 Add `expo-splash-screen` import + `preventAutoHideAsync()` side-effect to `apps/mobile/app/_layout.tsx`
- [x] 4.2 Replace the current layout body with an `AppReadyGate` hook (fonts + 2 s timeout) + effect-driven `hideAsync`
- [x] 4.3 Nest the component tree as `SafeAreaProvider → SettingsThemeProvider → AnnounceProvider → QueryProvider → Stack → CaptionBar`
- [x] 4.4 Keep the file under 30 lines of JSX — extract helpers to `apps/mobile/src/core/app-ready.ts`

## 5. Permissions rationale + capture gating

- [x] 5.1 Create `apps/mobile/src/features/capture/hooks/use-capture-permissions.ts` — aggregates camera / location / motion; re-checks on AppState change
- [x] 5.2 Create `apps/mobile/app/capture/permissions.tsx` — three rows + Grant button, announces on each grant
- [x] 5.3 Modify `apps/mobile/src/features/capture/components/capture-screen.tsx` — disable Scan + link caption when permissions missing
- [ ] 5.4 Add test `apps/mobile/src/features/capture/__tests__/capture-screen-permissions.test.tsx` — Scan disabled state + caption copy

## 6. Real capture driver

- [x] 6.1 Create `apps/mobile/src/engine/capture-driver.ts` — `captureProtocol(opts)` subscribes DeviceMotion for the window, reads one location fix (cached), averages pitch for `slopeDegree`, averages heading for `orientationDegrees`, composes `Protocol` via `@garden/core` factory with any missing field as `undefined`
- [x] 6.2 Create `apps/mobile/src/engine/__tests__/capture-driver.test.ts` — happy (all sensors return), side (null location), critical (zero samples throws `SmepErrors.captureTooShort()`), chaos (non-finite pitch ignored)
- [x] 6.3 Replace the hardcoded Protocol construction in `capture-screen.tsx` with `captureProtocol(...)` + announce-on-settled
- [x] 6.4 Add `<CameraView>` from `expo-camera` as the Viewfinder — props `active={isFocused}`, `style={{ height: VIEWFINDER_HEIGHT }}`
- [ ] 6.5 Add a "Pin property line" row to the Capture screen using `@garden/ui` TextInput (numeric, metres) that persists via `MemoryRepository.saveProperyLineDistance(plotId, meters)` (add to interface + both adapters)

## 7. Yield tab — YoY + colour tint + CSV

- [x] 7.1 Create `apps/mobile/src/features/yield/hooks/use-yoy.ts` — TanStack Query wrapping `yoyBySectorAndSpecies`, keyed `["yoy", plotId, year]`
- [x] 7.2 Create `apps/mobile/src/features/yield/components/yoy-table.tsx` — renders the two-column table with per-row pastel tint (interpolated from `tokens.colors.pastelLow`/`pastelHigh`)
- [x] 7.3 Create `apps/mobile/src/features/yield/components/export-csv-button.tsx` — uses `expo-file-system` + `expo-sharing`; announces on success / sharing-unavailable
- [x] 7.4 Rewrite `yield-screen.tsx` to render `<YoyTable />` + `<ExportCsvButton />` + the current-year summary card
- [x] 7.5 Add tests `yoy-table.test.tsx` (3 rows, sort, tint) and `export-csv-button.test.tsx` (happy, sharing unavailable)
- [ ] 7.6 Ensure `tokens.colors.pastelLow` + `pastelHigh` exist in every theme; add them if missing (extending `packages/ui/src/theme/tokens.ts`)

## 8. Wire announce() in every mutation

- [x] 8.1 Capture: `onScan` settle → `announce(result)`; permission grant → `announce(summary.success("Camera access granted"))`
- [x] 8.2 Sectors: save / rename / delete hooks → `onSuccess/onError` announces
- [x] 8.3 Yield: `useAppendHarvest` → announce; CSV button announce (already 7.3)
- [x] 8.4 Inventory: record-form + event-form onSubmit success/error → announce
- [x] 8.5 Settings: anthropic-key save / clear → announce

## 9. Config/settings UI for the three channels

- [ ] 9.1 Add three `Switch`-style toggles on the Settings screen: "Voice (TTS)", "Captions", "Haptics"
- [ ] 9.2 Bind the toggles to `settingsStore.voiceEnabled` / `captionsEnabled` / `hapticsEnabled`
- [ ] 9.3 Verify at runtime that disabling TTS silences `Speech.speak` but leaves captions visible

## 10. Docs + validate + ship

- [x] 10.1 Update `docs/STATUS.md` — flip rows 1, 2, 3, 5, 6, 7, 13 from 🔴/🟡 to ✅ as each task group lands
- [x] 10.2 Update `README.md` vision-vs-ships table once 🟢 rows flip
- [ ] 10.3 Update `HOW-TO.md` — add a "Scan the slope" section with the real flow and a "Listen for verdicts" section with the settings switches
- [ ] 10.4 Update `docs/app-flow.md` — new sequence diagram for Capture → Driver → Engine → Announce → Caption
- [ ] 10.5 Capture new screenshots: permissions rationale; real viewfinder; YoY table with tinted rows; CSV share sheet; caption bar visible
- [x] 10.6 Run `openspec validate make-capture-voice-yoy-real --strict` — must pass
- [x] 10.7 Run `pnpm check:all` — must pass
- [ ] 10.8 Commit with `git commit -s` and include a short reality-vs-docs diff line per section
