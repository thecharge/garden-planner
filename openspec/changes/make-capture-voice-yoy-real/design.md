## Context

The first bootstrap change (`bootstrap-spatial-garden-planner`) and the
follow-up `deliver-flows-docs-and-dev-command` stood up the silos: pure-TS
engine, memory repo, @garden/ui primitives, a Feature-Sliced Design mobile
app, and CI. What they did **not** do is cross the device-boundary for any
of the sensory features the product vision sells.

The transient spatial store, the `announce()` helper, the
`haptic-patterns` map, the `yieldBySectorAndYear` engine — all exist and
are tested. **Only the device wires are missing.** This change is about
plumbing: taking shipped-and-tested code and connecting it to Expo
modules that are already listed in `package.json`.

Constraint: the `@garden/*` packages MUST stay free of any
`expo-*` / `react-native` import. Every new Expo usage lives under
`apps/mobile/src/{core,engine,features}/*`. The union-ban lint,
≤300-line/file rule, and "no else-if / no switch" rules stay in force.

## Goals / Non-Goals

**Goals**

1. Tapping **Scan** reads the real camera preview, integrates 2 s of
   DeviceMotion, grabs one cached location fix, and produces a real
   `Protocol` — no hardcoded placeholders.
2. Every verdict (compliance, harvest, sector CRUD, inventory, settings)
   fires `announce()` and produces (a) an `expo-speech` utterance,
   (b) a caption in a persistent subtitle bar, (c) an `expo-haptics`
   pattern. Feature code does not import `expo-*` directly; it calls
   `announce()` which routes through a provider.
3. The Yield tab shows a real two-column current-year / prior-year table
   per sector + species, with yield-proportional pastel tints per row.
4. The Yield tab has a one-tap CSV export that writes
   `yield-<YYYY>.csv` and opens the share sheet.
5. The cold boot no longer looks stuck: splash screen is managed
   explicitly.

**Non-Goals**

- STT (speech-to-text). We're shipping half of the voice loop:
  _output_. Input (Vosk / whisper.cpp) is tracked in
  `make-voice-stt-real`.
- Skia overlay, Reanimated worklet bridging the spatial store. The
  driver will populate the store; the animation layer that consumes it is
  the next change (`make-spatial-overlay-real`).
- SQLite device adapter — still
  `make-device-sqlite-adapter`. YoY, CSV, and every form still work
  against the in-memory Map.
- Real BG translations — stubs remain stubs until the reviewer signs off
  in `ACCESSIBILITY.md`.

## Decisions

### D1. Capture driver is a single async function, not a stateful class

```ts
// apps/mobile/src/engine/capture-driver.ts
export const captureProtocol = async (opts: CaptureOptions): Promise<Protocol> => { ... }
```

- **Why not a class / hook?** A pure async function is mockable with
  one-line `jest.doMock`. Deterministic I/O in, `Protocol` out — same
  shape as the compliance-engine input. No lifecycle to leak.
- **How it integrates with the camera preview.** The `<CameraView>` sits
  on the Capture screen. The driver does NOT own the preview — the
  screen does. The driver subscribes to `DeviceMotion` for the window,
  pulls one `Location.getLastKnownPositionAsync` (fallback:
  `getCurrentPositionAsync`), and reads `pose-throttle` values the
  preview's `onCameraReady` → `onPreviewFrame` never populates today (we
  keep the store as a future extension point).
- **How we derive `distanceToPropertyLine`.** We cannot — not from sensors
  alone. The field becomes `undefined` in the emitted Protocol. The
  compliance engine already tolerates undefined optional fields. We add a
  `PropertyLinePrompt` view next to the Viewfinder letting the user
  tap-to-set the distance; the value is stored per plot and reused by
  default. This is honest: we don't fake a setback.
- **Alternatives considered.** A `useCaptureDriver` hook — too much React
  state for a one-shot operation. A class — over-engineered for a
  3-dependency composition.

### D2. `AnnounceProvider` composes channels from context

```tsx
// apps/mobile/src/core/announce/announce-provider.tsx
export const AnnounceProvider = ({ children }) => {
  const [captions, pushCaption] = useCaptionStore(...);
  const channels = useMemo(() => ({
    tts: (text) => Speech.speak(text, { language: i18n.language }),
    caption: pushCaption,
    haptic: (p) => Haptics.notificationAsync(mapToExpoType(p))
  }), []);
  return <AnnounceContext.Provider value={channels}>{children}</AnnounceContext.Provider>;
};
```

- **Why a provider, not a global.** Tests want to swap channels. Settings
  wants to toggle each channel independently. A provider keeps
  `@garden/ui`'s `announce()` pure.
- **How feature code calls it.** A `useAnnounce()` hook returns
  `(summary: Summary) => announce(summary, { channels })`. Feature code
  imports `useAnnounce` from `apps/mobile/src/core/announce` and calls
  `announce(summary.success(...))` on every terminal mutation event.
- **Where the caption bar lives.** Sticky below the tab bar in
  `app/_layout.tsx`, rendered conditionally when the caption store is
  non-empty. TTL per message is `config.CAPTION_TTL_MS` (default 5 s).
- **Why map `HapticPattern → Haptics.NotificationFeedbackType` in one
  place.** `packages/ui/src/announce/haptic-patterns.ts` stays free of
  expo imports; the mapper lives in `apps/mobile/src/core/announce/haptic.ts`.

### D3. YoY engine helper: `yoyBySectorAndSpecies`

```ts
// packages/engine/src/aggregation/yield.ts
export const yoyBySectorAndSpecies = async (
  repo: MemoryRepository, plotId: string, year: number
): Promise<ReadonlyArray<YoyRow>> => { ... }
```

- Returns `{ sectorId, speciesId, currentGrams, priorGrams, deltaGrams, deltaPct }`.
- Pure Node-testable; no RN import. Adds to existing `yield.ts`.
- UI consumer `use-yoy.ts` wraps it in TanStack Query keyed
  `["yoy", plotId, year]`.

### D4. Colour-tint per row uses pastel-low/pastel-high palette already in UI

`apps/mobile/src/features/yield/components/yoy-table.tsx` reads the
active theme's `colors.pastelLow` / `colors.pastelHigh`, tints the row
background by `min(row.currentGrams / maxGrams, 1.0)`. No new tokens; no
new shaders. The existing contrast auditor keeps both tokens inside their
WCAG thresholds.

### D5. CSV export: string-build in RAM, one file per year

- String concatenation in-memory (max ~N sectors × M species × one line —
  negligible).
- `FileSystem.writeAsStringAsync(uri, body)` → `Sharing.shareAsync(uri)`.
- URI is `${FileSystem.cacheDirectory}yield-${year}.csv`. Cache dir is
  fine; share sheet picks it up.
- Tests pass `FileSystem`/`Sharing` mocks.

### D6. Splash handshake

`apps/mobile/app/_layout.tsx`:

```tsx
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useAppReady(); // fonts + theme + query client
  useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  if (!ready) return null;
  return (...);
}
```

- `useAppReady` yields `true` once `useFonts` resolves (we already use
  Expo's font plugin; the hook returns immediately on the device but
  guards against the first-frame race).
- If `useFonts` errors, we still flip `ready=true` after a 2 s timeout so
  the app never stays blank.

### D7. Permissions rationale route

`app/capture/permissions.tsx` — one screen, three rows
(Camera / Location / Motion), a single "Grant access" button. On the
Capture tab, `useCapturePermissions()` checks all three; if any is
`Undetermined` or `Denied`, the Scan button is disabled and a caption
links to `/capture/permissions`. Once all three resolve, the tab re-renders
with Scan enabled.

## Risks / Trade-offs

- **Camera preview + DeviceMotion battery.** The 2 s window is short. The
  preview only renders while the user is on the Capture tab. Pause motion
  listeners on tab blur.
  → _Mitigation_: `useFocusEffect` stops the `DeviceMotion` subscription
  when the tab is unfocused.
- **`getLastKnownPositionAsync` may be null on a cold start.**
  → _Mitigation_: fall back to `getCurrentPositionAsync` with a 3 s
  timeout; on failure, emit the Protocol with `location: undefined`. The
  engine already allows it.
- **Expo-speech has no reliable voice for `bg-BG` on every device.**
  → _Mitigation_: when i18n.language is `bg`, pass `language: "bg-BG"`
  but fall back to device default if `Speech.getAvailableVoicesAsync`
  doesn't list one. (Captions still display the BG text when real
  translations ship.)
- **`Sharing.isAvailableAsync` returns false on headless CI / some
  emulators.** → _Mitigation_: the button's onPress checks first; on
  false, we announce `summary.actionRequired("Sharing not available on
this device. File saved to cache.")` and log the URI.
- **Permissions rationale becomes stale if the user toggles permissions
  in system settings while the app is running.** → _Mitigation_:
  `useCapturePermissions` re-checks on `AppState` change → `active`.
- **Splash handshake hides too early and the user sees a flash of
  unstyled content.** → _Mitigation_: the theme provider defaults to
  `pastel-light` synchronously; there is no period where tokens are
  undefined.

## Migration Plan

1. Land the change behind no feature flag — the old mock capture was never
   gated either. The Scan button simply becomes functional.
2. Follow-up change `make-voice-stt-real` layers STT on top of the
   `useVoiceLoop` hook that already exists.
3. Follow-up change `make-spatial-overlay-real` adds `skia/` and
   `reanimated/` dirs under `apps/mobile/src/engine/`. They will read from
   `spatial-store.ts` which this change is the first to populate.

## Open Questions

- **Do we persist the per-plot `distanceToPropertyLine` in
  `MemoryRepository`, or on the settings store?** Tentatively: on
  `MemoryRepository` under the plot record. Resolved before tasks.
- **Caption-bar placement on landscape — do we even support landscape?**
  Tentatively: no. The root `Stack.Screen` locks `portrait`. Decision
  stands unless a11y review pushes back.
- **Accessibility reviewer needs to sign off on TTS language selection
  logic.** Tracked in `ACCESSIBILITY.md`; this change does not block on
  it — TTS can fall back to device default until review.
