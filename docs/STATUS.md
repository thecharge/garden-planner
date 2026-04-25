# STATUS — what actually works, what doesn't

**Last reality-check: 2026-04-24.** This file is the ground truth. The README is
marketing-adjacent; this file is what shipped. If the two disagree, the README
is wrong and this file wins.

Every row has a `file:line` pointer so you can verify.

## Legend

- ✅ **Works** — the feature exists, runs on the device, is tested.
- 🟡 **Partial** — code exists but a critical layer is missing.
- 🔴 **Placeholder** — the claim is in the README but there is no implementation
  behind it.

## Reality table (post `production-readiness-and-ux-overhaul`)

| #   | Claim                                                                                | Status         | Evidence / Gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "pan the camera, get a Protocol (slope, orientation, water-table depth, confidence)" | ✅ Works       | **Verified on emulator 2026-04-23**: logcat captured `scan produced protocol { id: 'scan-…', slope: '65.3', hasLine: true }` from live DeviceMotion samples. `apps/mobile/src/engine/capture-driver.ts:66` fuses `expo-sensors` DeviceMotion (pitch/heading) + `expo-location` fix. `apps/mobile/src/features/capture/components/capture-screen.tsx:75` mounts a real `<CameraView facing="back" />`. Verdict caption reads _"Slope exceeds 15 degrees. Micro-permit engineering specs generated."_ — see `docs/screenshots/23-capture-verdict-slope-exceeds.png`. Gap: water-table not inferred — left `undefined`; property-line distance must be pinned by the user (honest). |
| 2   | "Voice output — every verdict is announced"                                          | ✅ Works       | `apps/mobile/src/core/announce/announce-provider.tsx` wires `expo-speech` (TTS), caption-store, `expo-haptics`. Every mutation hook (`use-sectors.ts`, `use-sector-yield.ts`, `use-inventory.ts`, `use-anthropic-key.ts`, `use-compliance-verdict.ts`) calls `announce()` on success/error. Gap: **STT input is still not wired.**                                                                                                                                                                                                                                                                                                                                               |
| 3   | "cross-modal redundancy — TTS + caption + haptic"                                    | ✅ Works       | Same provider fires three channels on every `announce()`. `caption-bar.tsx` mounts a sticky subtitle at the root layout (`src/core/root-gate.tsx:26`). Settings toggles (`voiceEnabled`, `hapticsEnabled`, `captionsMode`) individually gate each channel.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 4   | "Local-first SQLite"                                                                 | 🟡 Partial     | `apps/mobile/src/core/query/repository.ts:14` still in-memory `Map`. `expo-sqlite` still unused. Tracked in `make-device-sqlite-adapter`. Data resets on reinstall — HOW-TO.md:21 remains honest.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5   | Year-over-year yield                                                                 | ✅ Works       | Engine: `packages/engine/src/aggregation/yield.ts:58` — `yoyBySectorAndSpecies(repo, plotId, year)` returns current vs prior grams + signed delta + pct. UI: `apps/mobile/src/features/yield/components/yoy-table.tsx` renders a real two-column comparison with yield-proportional row tint. 5-case Jest table covers happy/side/critical.                                                                                                                                                                                                                                                                                                                                      |
| 6   | Sector heatmap of productivity                                                       | 🟡 Partial     | The YoY table's row tints use a yield-proportional alpha over `tokens.colors.primary` (so the biggest swings are visually louder). The full polygon-grid heatmap on a map view is still not shipped — tracked in `make-spatial-overlay-real`.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 7   | CSV export of yield history                                                          | ✅ Works       | `apps/mobile/src/features/yield/components/export-csv-button.tsx` — `expo-file-system.writeAsStringAsync` + `expo-sharing.shareAsync`. Header row plus one data row per sector/species. Tested (happy, sharing-unavailable, zero rows). Announces on success and on typed failure.                                                                                                                                                                                                                                                                                                                                                                                               |
| 8   | Rotation advisor                                                                     | ✅ Works       | Unchanged — screen + engine both live.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 9   | Nutrient advisor                                                                     | 🟡 Partial     | Irrigation card live. Liebig/amendment UI still a stub.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 10  | Skia overlay + Reanimated worklet                                                    | 🔴 Placeholder | Dirs still not present. Tracked in `make-spatial-overlay-real`. The new capture driver populates the spatial store's `pose-throttle` output as a side effect, so the consumer side is the only thing left.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 11  | i18n EN + BG                                                                         | 🟡 Partial     | Framework wired; BG strings mirror EN with TODO markers. Native translator sign-off still empty in `ACCESSIBILITY.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 12  | Sideload / APK build                                                                 | ✅ Works       | Unchanged. `BUILDING.md` walks the first-time builder through JDK/SDK → Gradle APK.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 13  | Splash / loading                                                                     | ✅ Works       | `apps/mobile/src/core/root-gate.tsx:12` calls `SplashScreen.preventAutoHideAsync()` at module load; `useAppReady` flips to true on first tick (2-second hard timeout). `SplashScreen.hideAsync()` fires in a `useEffect` once ready. No more "constantly loading".                                                                                                                                                                                                                                                                                                                                                                                                               |
| 14  | STT (speech-to-text)                                                                 | 🔴 Placeholder | The `useVoiceLoop` scaffold accepts a `{ transcript, sttConfidence }` but nothing feeds it. Vosk / whisper.cpp integration is tracked in `make-voice-stt-real`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 15  | Permissions rationale screen                                                         | ✅ Works       | `apps/mobile/app/capture/permissions.tsx` + `apps/mobile/src/features/capture/components/permissions-screen.tsx` — three rows (Camera / Location / Motion) + Grant button. `use-capture-permissions.ts` re-polls on `AppState` change. Capture's Scan button is gated behind `allGranted` with an `actionRequired` caption meanwhile.                                                                                                                                                                                                                                                                                                                                            |
| 17  | Sound off by default; opt-in onboarding card                                         | ✅ Works       | `apps/mobile/src/features/settings/store/settings-store.ts` — `hapticsEnabled` and `voiceEnabled` default to `false`. `sound-onboarding-card.tsx` renders on the home dashboard until dismissed; tapping "Enable sound & haptics" sets both to `true` and sets `soundOnboardingDismissed = true`. Tested: `settings-screen.test.tsx`.                                                                                                                                                                                                                                                                                                                                            |
| 18  | Permissions card in Settings                                                         | ✅ Works       | `apps/mobile/src/features/settings/components/permissions-card.tsx` — camera / location / motion rows with "Granted" / "Not granted" labels; re-polls on `AppState` change. Manage button navigates to the rationale screen if any permission is still undetermined, else opens `Linking.openSettings()`. `settings-screen.tsx` renders it under a "Camera & Location" heading. Tested: `permissions-card.test.tsx`.                                                                                                                                                                                                                                                             |
| 19  | Home dashboard (replaces Redirect at app root)                                       | ✅ Works       | `apps/mobile/src/features/overlay/components/home-dashboard.tsx` — hero "Tap to scan" CTA, sector-health card (empty-state aware), last-scan card, rotation-nudge card. `useHomeDashboard` hook composes `useSectors`, spatial store, rotation summary. `apps/mobile/app/index.tsx` renders `<HomeDashboard />` instead of a bare `<Redirect />`. Tested: `home-dashboard.test.tsx`.                                                                                                                                                                                                                                                                                             |
| 20  | Capture → Sector flow                                                                | ✅ Works       | Post-scan verdict area in `capture-screen.tsx` shows "Create sector from this scan" button. Tapping opens `create-sector-sheet.tsx` — name input pre-filled "Scan YYYY-MM-DD", read-only slope/orientation display, Confirm/Cancel. Confirm calls `useSaveSector` with `slopeDegree` + `orientationDegrees` metadata. `Sector` type in `@garden/config` carries `slopeDegree?: number` + `orientationDegrees?: number`. `sector-detail-screen.tsx` shows a scan metadata card when those fields are present. Tested: `create-sector-sheet.test.tsx` (happy + cancel path).                                                                                                       |
| 16  | Capture stability — no OOM on the emulator                                           | ✅ Works       | **Verified on emulator-5554 2026-04-24**: 20 s viewfinder open → PID unchanged (3364), tab round-trip Capture→Sectors→Capture → clean remount, Scan → verdict rendered, zero `FATAL` / `lowmemorykiller-kill` events in a scoped logcat watch. Fix in commit `41ae52c`: (a) `apps/mobile/src/features/capture/components/capture-screen.tsx` — `<CameraView>` mounts only when `perms.camera && viewfinderOpen && isFocused` and auto-closes after a scan; (b) AVD config bumped to 3 GB RAM / 512 MB Dalvik heap / `gpu host` via `scripts/create-avd.sh` + emulator boot flags in `scripts/launch-emulator.sh`. Proof: `docs/screenshots/capture-opt-in.png`.                  |

## "What actually works today" for a user who sideloads the APK

1. **Sectors** — add/rename/delete sectors (each mutation announces a Summary).
2. **Sector detail** — rename, log a harvest (announced), delete the sector (idempotent).
3. **Yield tab** — **real two-column YoY table** with yield-proportional row tint, plus totals card, plus **CSV export** (share sheet).
4. **Inventory tab** — save seed/plant/tool/amendment records; append event rows; each action announces a Summary.
5. **Rotation tab** — per-sector species recommendation with reason-code and citation.
6. **Nutrient tab** — weekly irrigation target (mm) from FAO-56 Penman-Monteith.
7. **Settings** — paste the Anthropic key, flip theme, body font, and the three output channels (voice / captions / haptics) independently.
8. **Capture tab** — viewfinder starts closed to save memory. Tap **Open viewfinder** to mount `<CameraView>`; `useIsFocused` unmounts it when the tab blurs. Scan triggers a 2-second DeviceMotion sample window → `Protocol` → compliance verdict → announced via TTS + caption + haptic. Viewfinder auto-closes after a scan. Pin a property-line distance first to get a setback verdict; otherwise the engine routes to `actionRequired` honestly.

Every row in this list is exercised by a Jest test under the matching package.

## What still does NOT work today

1. **STT (voice input).** The design contract exists but no engine is wired. Scan is tap-driven.
2. **SQLite persistence.** In-memory only — data resets on reinstall.
3. **Skia overlay / Reanimated worklet.** No on-device animation or polygon painting yet.
4. **Liebig amendments UI.** Irrigation card is real; amendment recommendation is still a stub.
5. **Real BG translations.** Strings mirror EN with TODO markers.

## How to verify the reality yourself

### Static: grep the source

```bash
# expo-camera IS imported now
grep -rn "expo-camera" apps/mobile/src

# announce() IS called in feature hooks now
grep -rn "announce(" apps/mobile/src/features/

# expo-sqlite is STILL not used (follow-up change pending)
grep -rn "expo-sqlite" apps/mobile/src    # still empty

# YoY UI has both years
grep -n "yoyBySectorAndSpecies\|priorGrams\|currentGrams" apps/mobile/src/features/yield/

# Caption bar is mounted at the root layout
grep -n "CaptionBar" apps/mobile/src/core/root-gate.tsx

# Capture viewfinder is focus-gated + opt-in
grep -n "useIsFocused\|viewfinderOpen" apps/mobile/src/features/capture/components/capture-screen.tsx
```

### Dynamic: drive the app

```bash
. ./scripts/setup-env.sh && ./scripts/launch-emulator.sh
pnpm dev                                 # build + install + tail Metro
scripts/adb-ui.sh grant
scripts/adb-ui.sh tap-tab capture
scripts/adb-ui.sh shot capture-default   # proof: viewfinder closed
scripts/adb-ui.sh tap "Open viewfinder"
scripts/adb-ui.sh shot capture-opt-in    # proof: viewfinder streaming
scripts/adb-ui.sh tap "Scan"
sleep 4
scripts/adb-ui.sh shot capture-verdict   # proof: verdict rendered
scripts/adb-ui.sh alive                  # must print PID=<n>
```

## What we are tracking next (OpenSpec changes)

- **`make-voice-stt-real`** — wire Vosk / whisper.cpp into `useVoiceLoop`.
- **`make-spatial-overlay-real`** — add `apps/mobile/src/engine/{skia,reanimated}/` consuming the spatial store populated by the capture driver.
- **`make-device-sqlite-adapter`** — real SQLite persistence with numbered migrations.
- **BG translator sign-off** — named reviewer required in `ACCESSIBILITY.md`.
