---
name: build-apk
description: Build a local-gradle garden-planner APK (no EAS cloud account needed). Use when the user wants a side-loadable `.apk` file on disk.
---

## Purpose

Produce `android/app/build/outputs/apk/release/app-release.apk` via Expo prebuild + Gradle.

## Steps

1. Source env + verify:
   ```bash
   . ./scripts/setup-env.sh
   ./scripts/doctor.sh
   ```
2. Build:
   ```bash
   pnpm --filter apps-mobile run apk:local
   ```
3. Report the APK path and size:
   ```bash
   ls -lh apps/mobile/android/app/build/outputs/apk/release/
   ```
4. If the user wants to install on a connected device:
   ```bash
   adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk
   ```

## Alternative — EAS cloud build

Requires an Expo account. Not needed for local development.

```bash
npm i -g eas-cli
eas login
pnpm --filter apps-mobile run apk
```

## Troubleshooting

- **`BUILD FAILED`** — scroll the Gradle output for the first `ERROR:` line. Most commonly: outdated build-tools (run `sdkmanager "build-tools;35.0.0"`) or a Kotlin/JDK mismatch (verify `java --version` reports 17+).
- **Missing fonts** — ensure `apps/mobile/assets/fonts/Lexend-Regular.ttf`, `Lexend-Bold.ttf`, `OpenDyslexic-Regular.otf` exist. Re-fetch per BUILDING.md if not.
- **Huge APK** — strip debug architectures in `app.json` or use `./gradlew app:bundleRelease` for an AAB instead.
