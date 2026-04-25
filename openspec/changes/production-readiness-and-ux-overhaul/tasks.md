## 1. Fix pre-existing type errors blocking clean CI

- [x] 1.1 Fix `exactOptionalPropertyTypes` errors in `apps/mobile/src/engine/capture-driver.ts` (distanceToPropertyLine, waterTableDepth, orientationDegrees, elevationMeters, headingRad, altitudeMeters)
- [x] 1.2 Fix `loading` prop type error in `apps/mobile/src/features/capture/components/capture-screen.tsx` — add `loading?: boolean` to `GardenButtonProps` in `@garden/ui` or remove the prop
- [x] 1.3 Run `pnpm turbo run typecheck` and confirm zero errors

## 2. Sound opt-in — defaults and Settings UI

- [x] 2.1 Change `hapticsEnabled` and `voiceEnabled` defaults to `false` in `apps/mobile/src/features/settings/store/settings-store.ts`
- [x] 2.2 Add "Sound & Notifications" card to `settings-screen.tsx` with three toggles: Enable voice (TTS), Enable haptics, Captions mode
- [x] 2.3 Wire each toggle to the corresponding `settingsStore.setX` action with correct `accessibilityLabel`
- [x] 2.4 Add first-run onboarding card component `apps/mobile/src/features/settings/components/sound-onboarding-card.tsx` with "Enable sound & haptics" button that sets both `voiceEnabled` and `hapticsEnabled` to `true` and marks card as dismissed
- [x] 2.5 Render `SoundOnboardingCard` on the home dashboard (once, dismiss-once logic via a store flag)
- [x] 2.6 Write `settings-screen.test.tsx` with `it.each` cases: renders without crash, sound toggle on/off updates store, haptics toggle updates store, captions mode cycle updates store

## 3. Camera permissions in Settings

- [x] 3.1 Create `apps/mobile/src/features/settings/components/permissions-card.tsx` — shows camera / location / motion permission status rows with "Granted" / "Not granted" labels and a "Manage permissions" or "Open device settings" button
- [x] 3.2 Import `useCapturePermissions` (from capture feature) in the permissions card; re-poll on `AppState change`
- [x] 3.3 Implement navigate-to-rationale vs `Linking.openSettings()` branch based on whether any permission is still "undetermined"
- [x] 3.4 Add `PermissionsCard` to `settings-screen.tsx` under a "Camera & Location" heading
- [x] 3.5 Write `permissions-card.test.tsx` with cases: all granted shows "Granted" labels, one denied shows "Manage" button, AppState change triggers re-check

## 4. Capture → Sector flow

- [x] 4.1 Extend `SectorRecord` type (in `@garden/config` or feature types) to include optional `slopeDegree?: number` and `orientationDegrees?: number` metadata fields
- [x] 4.2 Update `useSaveSector` and the memory repository to persist the new optional fields
- [x] 4.3 Create `apps/mobile/src/features/capture/components/create-sector-sheet.tsx` — a bottom-sheet with a name text input (pre-filled "Scan YYYY-MM-DD"), read-only slope/orientation display, "Create sector" confirm and "Cancel" buttons
- [x] 4.4 Add "Create sector from this scan" primary button to the post-scan verdict area in `capture-screen.tsx`; tapping opens `CreateSectorSheet` with the current Protocol
- [x] 4.5 Wire `CreateSectorSheet` confirm to call `useSaveSector` with protocol metadata, fire announce on success, and close the sheet
- [x] 4.6 Add "Scan new sector" shortcut to `sectors-screen.tsx` (FAB secondary action or toolbar button) that navigates to `/(tabs)/capture` and sets `viewfinderOpen = true` via the spatial store or route params
- [x] 4.7 Update `sector-detail-screen.tsx` to display `slopeDegree` and `orientationDegrees` as read-only rows when present
- [x] 4.8 Write capture-to-sector integration test: happy path (scan → open sheet → confirm → sector saved with metadata) and cancel path

## 5. Home dashboard

- [x] 5.1 Create `apps/mobile/src/features/capture/components/home-dashboard.tsx` (or `apps/mobile/src/features/overlay/components/home-dashboard.tsx`) with: hero "Tap to scan" CTA card, sector-health summary card, rotation-nudge card, last-scan card
- [x] 5.2 Implement `useHomeDashboard` hook that composes `useSectors`, `useLastScanProtocol` (reads from spatial store), and `useRotationSummary` queries
- [x] 5.3 Replace the redirect in `apps/mobile/app/index.tsx` with a `HomeDashboard` screen render (keep tab navigation; dashboard is the root screen before entering a tab)
- [x] 5.4 Wire "Tap to scan" hero CTA to navigate to `/(tabs)/capture` and open the viewfinder
- [x] 5.5 Handle empty state: no sectors → show "No sectors yet" prompt in the sector-health card
- [x] 5.6 Ensure every card has a unique `accessibilityLabel`
- [x] 5.7 Write `home-dashboard.test.tsx` with cases: renders hero CTA, shows no-sectors prompt when empty, shows last-scan card when protocol available, rotation nudge card rendered when rotation recommendation exists

## 6. Production build pipeline

- [x] 6.1 Add `"production"` profile to `apps/mobile/eas.json` with `android.buildType: "app-bundle"` and reference to signing env vars
- [x] 6.2 Update `android/app/build.gradle` signing config block to read `KEYSTORE_PATH`, `KEYSTORE_ALIAS`, `KEYSTORE_PASSWORD`, `KEY_PASSWORD` from env (guarded by `if (System.getenv("KEYSTORE_PATH") != null)`)
- [x] 6.3 Add `apk:prod` script to `apps/mobile/package.json`: `expo prebuild --platform android && ./gradlew assembleRelease`
- [x] 6.4 Add `apk:prod` proxy script to root `package.json`
- [x] 6.5 Create `docs/RELEASE.md` with steps: bump version in `app.json`, generate keystore (first time), set `.env.local` vars, run `pnpm check:all`, run `pnpm apk:prod`, verify on device, tag release commit
- [x] 6.6 Add `.env.local` to `.gitignore` if not already present

## 7. Test matrix — coverage thresholds

- [x] 7.1 Add `coverageThreshold: { global: { lines: 70, functions: 80 } }` to `jest.preset.cjs`
- [x] 7.2 Run `pnpm test:coverage` and identify any packages still below threshold after new test files land
- [x] 7.3 Add missing `it.each` tables to packages below threshold (engine, memory, config) until all pass
- [x] 7.4 Confirm `pnpm test:coverage` exits 0 on main with all new test files present

## 8. README overhaul

- [x] 8.1 Rewrite the opening of `README.md`: replace the existing first paragraph with a two-sentence plain-language description + video embed placeholder `<!-- TODO: add 30-second demo video -->`
- [x] 8.2 Add a `## What can I do today?` section immediately after the intro listing ✅ shipped capabilities in user language (photograph your plot, log a harvest, get a rotation recommendation, export yield data, check irrigation target)
- [x] 8.3 Move the existing "Run it" and architecture sections below the new user-facing sections
- [x] 8.4 Verify no jargon or command-line content appears before `## What can I do today?`
- [x] 8.5 Update `docs/STATUS.md` to reflect new capabilities added by this change (sound defaults, permissions card, dashboard, capture-to-sector)
