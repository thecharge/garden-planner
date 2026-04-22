# Commands

Developer cheat sheet. Every script at the repo root, every script under `scripts/`, what each does, when to reach for it.

All `pnpm …` commands run from the repo root unless noted.

## The one command you usually want

```bash
pnpm dev
```

Boots the emulator (if not running), starts Metro, installs the APK, tails the Metro log. Ctrl+C stops only the tail — Metro keeps running so hot-reload survives between runs. Teardown with `pnpm dev:stop`.

## Root `pnpm` scripts

| Command                | Runs                                      | Reach for it when                                                                             |
| ---------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`             | `bash scripts/dev.sh`                     | You want to run the app on the Android emulator. One command.                                 |
| `pnpm dev:stop`        | `bash scripts/dev-stop.sh`                | Kill Metro + shut down the emulator. Full teardown.                                           |
| `pnpm doctor`          | `bash scripts/doctor.sh`                  | Verify JDK / Android SDK / adb / emulator / node / pnpm are present.                          |
| `pnpm apk`             | `pnpm --filter apps-mobile run apk:local` | Build a release `.apk` locally via `expo prebuild` + `./gradlew assembleRelease`.             |
| `pnpm install`         | pnpm                                      | Install workspace dependencies.                                                               |
| `pnpm build`           | `turbo run build`                         | Compile every TypeScript package.                                                             |
| `pnpm typecheck`       | `turbo run typecheck`                     | `tsc --noEmit` across the workspace.                                                          |
| `pnpm lint`            | `turbo run lint`                          | ESLint across every package.                                                                  |
| `pnpm test`            | `turbo run test`                          | Run every Jest suite across the workspace.                                                    |
| `pnpm test:coverage`   | `turbo run test -- --coverage`            | Same, with coverage reports per package under `packages/*/coverage/`.                         |
| `pnpm spell`           | `cspell` on TS/MD                         | Catch typos in prose + strings.                                                               |
| `pnpm format`          | `prettier --write`                        | Format every `.ts`/`.tsx`/`.md`/`.json`/`.yml`.                                               |
| `pnpm format:check`    | `prettier --check`                        | Verify formatting; CI equivalent.                                                             |
| `pnpm audit:deps`      | `pnpm audit --audit-level=high`           | Check for high-severity CVEs in the dep tree.                                                 |
| `pnpm audit:citations` | engine audit script                       | Every science-data entry in `@garden/engine` must cite a source.                              |
| `pnpm audit:contrast`  | UI audit script                           | Every theme foreground/background pair meets WCAG AA (AAA for `high-contrast`).               |
| `pnpm check:all`       | Composite                                 | Typecheck, lint, test, spell, format:check, audit:citations, audit:contrast. The pre-PR gate. |
| `pnpm clean`           | `turbo run clean` + `rm -rf node_modules` | Nuke build artefacts. Use before shipping a fresh clone experiment.                           |

## `scripts/` shell scripts

| Script                       | What it does                                                                                                       | When to reach for it                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/setup-env.sh`       | Exports `JAVA_HOME`, `ANDROID_HOME`, and adds cmdline-tools/platform-tools/emulator to PATH.                       | Source it (`. ./scripts/setup-env.sh`) before any adb/emulator/gradle call from a fresh shell. `pnpm dev` sources it automatically. |
| `scripts/doctor.sh`          | Prints a table of JDK/SDK/adb/emulator/pnpm/node status. Exit 0 if all good.                                       | First thing to run if `pnpm dev` complains.                                                                                         |
| `scripts/create-avd.sh`      | Creates a `Pixel_6_API_35` AVD if it does not already exist. Installs the system image via `sdkmanager` if needed. | Idempotent. Called by `launch-emulator.sh`. Rerun after wiping AVDs.                                                                |
| `scripts/launch-emulator.sh` | Boots the AVD, waits for `adb wait-for-device`, waits for `sys.boot_completed`.                                    | When you want the emulator up without the full `pnpm dev` dance.                                                                    |
| `scripts/dev.sh`             | The one-command launcher: sets up env → doctor → emulator → adb reverse → Metro in bg → expo run:android → tail.   | Normal dev loop. Prefer `pnpm dev` which wraps this.                                                                                |
| `scripts/dev-stop.sh`        | Kills Metro (by PID file or `lsof :8081`), shuts down the emulator via `adb emu kill`.                             | End-of-day teardown.                                                                                                                |

## `apps-mobile` scripts

Run with `pnpm --filter apps-mobile run <script>` (or `cd apps/mobile && pnpm run <script>`).

| Script      | What it does                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `start`     | `expo start` — bare Metro.                                                                        |
| `android`   | `expo run:android` — prebuild + native build + install + start.                                   |
| `apk:local` | `expo prebuild --platform android && cd android && ./gradlew assembleRelease`. Local release APK. |
| `apk`       | `eas build --platform android --profile preview`. Cloud build via EAS.                            |
| `doctor`    | `expo doctor`.                                                                                    |
| `prebuild`  | `expo prebuild --platform android`.                                                               |
| `typecheck` | `tsc -p tsconfig.json --noEmit`.                                                                  |
| `lint`      | ESLint over `src/` and `app/`.                                                                    |
| `test`      | Jest (pure Node + RN-mocked component tests).                                                     |
| `clean`     | Nukes `.expo`, `dist`, `.turbo`, `android`, `ios`.                                                |

## Per-package scripts

Every `@garden/<pkg>` has `build`, `typecheck`, `lint`, `test`, `clean`. Scoped runs:

```bash
pnpm --filter @garden/config run test
pnpm --filter @garden/engine run audit:citations
pnpm --filter @garden/ui     run audit:contrast
pnpm --filter @garden/memory run build
```

## Ports

| Port   | Used by                                                                                     |
| ------ | ------------------------------------------------------------------------------------------- |
| `8081` | Metro bundler. `adb reverse tcp:8081 tcp:8081` maps the emulator's localhost to the host's. |

## Environment variables

`scripts/setup-env.sh` sets these:

- `JAVA_HOME=/snap/android-studio/current/jbr` (OpenJDK 21, JetBrains Runtime).
- `ANDROID_HOME=$HOME/Android/Sdk` and `ANDROID_SDK_ROOT=$ANDROID_HOME`.
- Prepends to `PATH`: `$JAVA_HOME/bin`, `$ANDROID_HOME/cmdline-tools/latest/bin`, `$ANDROID_HOME/platform-tools`, `$ANDROID_HOME/emulator`, `$ANDROID_HOME/build-tools/35.0.0`.

Override the AVD name with `GARDEN_PLANNER_AVD=My_AVD_Name pnpm dev`.

## Common troubleshooting one-liners

```bash
# My adb reverse got reset
adb reverse tcp:8081 tcp:8081

# Kill anything on Metro's port
lsof -ti :8081 | xargs kill -9

# Wipe the app's data on the emulator (preserve install)
adb shell pm clear com.gardenplanner

# Force-reinstall the APK
adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk

# See the emulator's logcat live
adb logcat | grep -E "ReactNativeJS|Garden"
```
