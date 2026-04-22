## ADDED Requirements

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
