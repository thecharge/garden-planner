# dev-environment Specification

## Purpose
TBD - created by archiving change fix-bootstrap-gaps. Update Purpose after archive.
## Requirements
### Requirement: Dev environment bootstrap scripts

The repo SHALL ship shell scripts under `scripts/` that set up and verify the Android / Expo development environment on a Linux workstation. The scripts MUST work without root (`sudo`).

#### Scenario: `setup-env.sh` sourcing exports the required variables
- **WHEN** a user runs `. ./scripts/setup-env.sh`
- **THEN** `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT` MUST be set
- **AND** `java`, `adb`, `emulator`, `sdkmanager`, `avdmanager` MUST be resolvable on `PATH`

#### Scenario: `doctor.sh` reports environment status
- **WHEN** `./scripts/doctor.sh` runs
- **THEN** it MUST print a status line for each of: JDK (version), Android SDK (path), platform-tools (adb version), emulator, pnpm, Node, Expo CLI (if present)
- **AND** it MUST exit 0 when all required items are present and non-zero with a clear message when any are missing

#### Scenario: `create-avd.sh` is idempotent
- **WHEN** `./scripts/create-avd.sh` runs twice in a row
- **THEN** the first run MUST create an AVD named `Pixel_6_API_35`
- **AND** the second run MUST detect the existing AVD and exit 0 without error

#### Scenario: `launch-emulator.sh` boots the AVD
- **WHEN** `./scripts/launch-emulator.sh` runs with the AVD present
- **THEN** the emulator process MUST start
- **AND** `adb wait-for-device` MUST complete within a reasonable timeout
- **AND** `adb devices` MUST list the emulator

### Requirement: `apps/mobile` dependencies are self-sufficient

`apps/mobile/package.json` SHALL list every Expo and React Native package the app imports in `dependencies` (not `peerDependencies`). Versions MUST be exact (no caret, no tilde, no wildcard). `pnpm install` from a clean checkout MUST produce a working `node_modules` for the app without relying on hoisting from other workspaces.

#### Scenario: Fresh install resolves every Expo dep locally
- **WHEN** a fresh `pnpm install` runs against the workspace
- **THEN** `apps/mobile/node_modules/expo`, `apps/mobile/node_modules/react-native`, and `apps/mobile/node_modules/react-native-paper` MUST be present (or resolvable deterministically from the hoisted root)

#### Scenario: Exact version pins
- **WHEN** an auditor inspects the dependency ranges in `apps/mobile/package.json`
- **THEN** every Expo / RN / Paper / Reanimated / Skia / Anthropic version MUST be an exact version string (no `^`, `~`, `*`, or `latest`)

### Requirement: Font assets exist where `app.json` references them

The mobile app SHALL ship `Lexend-Regular.ttf`, `Lexend-Bold.ttf`, and `OpenDyslexic-Regular.ttf` in `apps/mobile/assets/fonts/`, matching the paths declared in `apps/mobile/app.json`'s `expo-font` plugin config.

#### Scenario: Fonts are bundled, not fetched at runtime
- **WHEN** `expo start` launches the bundler
- **THEN** the font files MUST resolve on disk
- **AND** the APK build MUST embed them in assets (no network fetch)

#### Scenario: Font licences are declared
- **WHEN** a reviewer inspects the repo
- **THEN** `apps/mobile/assets/fonts/LICENSES.md` MUST list each font with its SIL OFL link

### Requirement: `expo-env.d.ts` and `.env.example` exist

`apps/mobile/` SHALL contain an `expo-env.d.ts` enabling expo-router's typed routes, and an `.env.example` documenting any env vars the app reads.

#### Scenario: Typed routes compile
- **WHEN** `pnpm --filter apps-mobile run typecheck` runs
- **THEN** no error referencing missing `expo-router/types` MUST appear

### Requirement: `BUILDING.md` documents the full env setup

A repo-root `BUILDING.md` SHALL explain every step a new contributor needs to: install JDK 17+, install the Android SDK (including accepting licences), set env vars, create an AVD, launch it, run `pnpm install`, start the dev server, and build a local APK. A troubleshooting section SHALL cover common errors (missing node-gyp, Kotlin/JDK mismatch, Reanimated babel-plugin ordering).

#### Scenario: A new contributor can follow BUILDING.md
- **WHEN** a contributor reads BUILDING.md front-to-back on a fresh Ubuntu 24 machine
- **THEN** the steps MUST produce a running emulator and a running `expo start` session
- **AND** no step MUST require information not in the doc

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

