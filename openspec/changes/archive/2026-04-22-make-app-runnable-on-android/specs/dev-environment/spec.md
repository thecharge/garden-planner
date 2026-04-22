## ADDED Requirements

### Requirement: Native dependencies build successfully during install

`pnpm install` SHALL produce a node_modules tree in which `@shopify/react-native-skia` and `react-native-reanimated` have completed their native / post-install scripts. `pnpm-workspace.yaml` MUST include these in `onlyBuiltDependencies`.

#### Scenario: Skia and Reanimated native builds run at install
- **WHEN** a fresh `pnpm install` runs against the workspace
- **THEN** `@shopify/react-native-skia` and `react-native-reanimated` MUST NOT appear in the "Ignored build scripts" warning
- **AND** subsequent `expo run:android` MUST NOT fail linking against them

### Requirement: The Android app installs and launches on the running emulator

Running `pnpm --filter apps-mobile run android` against a live `adb devices` emulator SHALL produce an APK, install it on the emulator, and launch the `com.chepinci.gardenplanner` package. The Capture screen MUST render without a red-box (JS) error.

#### Scenario: Cold `expo run:android` installs and launches
- **WHEN** the Pixel_9 AVD is booted (`adb devices` shows at least one `device` line) and `pnpm --filter apps-mobile run android` is invoked
- **THEN** Gradle MUST complete `assembleDebug`
- **AND** the APK MUST install via `adb install`
- **AND** the app's main process MUST appear in `adb shell ps | grep gardenplanner`
- **AND** the Capture screen (the default `app/index.tsx` → `app/capture.tsx`) MUST render without an uncaught JS error

#### Scenario: A failed build surfaces an actionable error
- **WHEN** any step in the install/build/launch pipeline fails
- **THEN** the error MUST name the component (Gradle / Metro / Expo / adb) that failed
- **AND** `BUILDING.md`'s Troubleshooting section MUST cover the specific failure class
