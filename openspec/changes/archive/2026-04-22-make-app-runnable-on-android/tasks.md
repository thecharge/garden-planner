## 1. Fix lint-staged

- [x] 1.1 Install `cross-env` as a root devDep.
- [x] 1.2 Rewrite root `package.json` `lint-staged` config to use `cross-env` for ESLint and drop `--max-warnings=0` from the staged invocation.
- [x] 1.3 Expand `.prettierignore` to cover `coverage/`, `*.lcov`, `lcov.info`, `*.ttf`, `*.otf`, `*.apk`, `*.aab`, `.cspell-cache`, `android/`, `ios/`, `**/.turbo/**`, `**/dist/**`, `**/node_modules/**`.
- [x] 1.4 Smoke-test: stage a dummy file, commit, pre-commit hook MUST succeed.

## 2. Enable Skia + Reanimated native builds

- [x] 2.1 Add `@shopify/react-native-skia` and `react-native-reanimated` to `pnpm-workspace.yaml` `onlyBuiltDependencies`.
- [x] 2.2 Run `pnpm install` and verify "Ignored build scripts" no longer lists them.

## 3. First commit

- [x] 3.1 `git add .` (whole tree).
- [x] 3.2 `git commit -m "initial commit"` — MUST succeed with the real pre-commit hook.

## 4. Run the app on the emulator

- [x] 4.1 Boot the Pixel_9 AVD (`./scripts/launch-emulator.sh` or via Android Studio).
- [x] 4.2 `pnpm --filter apps-mobile run android` — Gradle build + install.
- [x] 4.3 Iterate through any build failures; fix each; re-run. Common failures: Reanimated Babel plugin order, Skia ABI mismatch, Metro watcher limits.
- [x] 4.4 Confirm the app renders the Capture screen without a JS red-box.
- [x] 4.5 Capture `adb logcat` snippet around app launch for the evidence section.
- [x] 4.6 Update `BUILDING.md` Troubleshooting section with every real error encountered + its fix.

## 5. Close deferred bootstrap-spatial-garden-planner tasks

- [x] 5.1 Walk every `[ ]` line in `openspec/changes/bootstrap-spatial-garden-planner/tasks.md`.
- [x] 5.2 Mark `[x]` with an inline evidence note wherever the work is already done (after `fix-bootstrap-gaps` or this change).
- [x] 5.3 For items that genuinely cannot ship today (reviewer sign-offs, live cadastral source, offline STT library choice), keep `[ ]` and add an inline "tracked in DEVICE-TESTING.md / ACCESSIBILITY.md" note so no task is silently deferred.
- [x] 5.4 Verify `openspec status --change bootstrap-spatial-garden-planner` shows the closure.

## 6. Verification

- [x] 6.1 `pnpm check:all` — green.
- [x] 6.2 `git commit --allow-empty -m "test"` — pre-commit hook succeeds.
- [x] 6.3 `adb devices` shows the emulator.
- [x] 6.4 `adb shell ps -A | grep gardenplanner` shows the app's process.
- [x] 6.5 `openspec validate make-app-runnable-on-android` — valid.
