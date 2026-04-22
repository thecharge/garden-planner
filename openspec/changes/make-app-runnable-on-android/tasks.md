## 1. Fix lint-staged

- [ ] 1.1 Install `cross-env` as a root devDep.
- [ ] 1.2 Rewrite root `package.json` `lint-staged` config to use `cross-env` for ESLint and drop `--max-warnings=0` from the staged invocation.
- [ ] 1.3 Expand `.prettierignore` to cover `coverage/`, `*.lcov`, `lcov.info`, `*.ttf`, `*.otf`, `*.apk`, `*.aab`, `.cspell-cache`, `android/`, `ios/`, `**/.turbo/**`, `**/dist/**`, `**/node_modules/**`.
- [ ] 1.4 Smoke-test: stage a dummy file, commit, pre-commit hook MUST succeed.

## 2. Enable Skia + Reanimated native builds

- [ ] 2.1 Add `@shopify/react-native-skia` and `react-native-reanimated` to `pnpm-workspace.yaml` `onlyBuiltDependencies`.
- [ ] 2.2 Run `pnpm install` and verify "Ignored build scripts" no longer lists them.

## 3. First commit

- [ ] 3.1 `git add .` (whole tree).
- [ ] 3.2 `git commit -m "initial commit"` — MUST succeed with the real pre-commit hook.

## 4. Run the app on the emulator

- [ ] 4.1 Boot the Pixel_9 AVD (`./scripts/launch-emulator.sh` or via Android Studio).
- [ ] 4.2 `pnpm --filter apps-mobile run android` — Gradle build + install.
- [ ] 4.3 Iterate through any build failures; fix each; re-run. Common failures: Reanimated Babel plugin order, Skia ABI mismatch, Metro watcher limits.
- [ ] 4.4 Confirm the app renders the Capture screen without a JS red-box.
- [ ] 4.5 Capture `adb logcat` snippet around app launch for the evidence section.
- [ ] 4.6 Update `BUILDING.md` Troubleshooting section with every real error encountered + its fix.

## 5. Close deferred bootstrap-spatial-garden-planner tasks

- [ ] 5.1 Walk every `[ ]` line in `openspec/changes/bootstrap-spatial-garden-planner/tasks.md`.
- [ ] 5.2 Mark `[x]` with an inline evidence note wherever the work is already done (after `fix-bootstrap-gaps` or this change).
- [ ] 5.3 For items that genuinely cannot ship today (reviewer sign-offs, live cadastral source, offline STT library choice), keep `[ ]` and add an inline "tracked in DEVICE-TESTING.md / ACCESSIBILITY.md" note so no task is silently deferred.
- [ ] 5.4 Verify `openspec status --change bootstrap-spatial-garden-planner` shows the closure.

## 6. Verification

- [ ] 6.1 `pnpm check:all` — green.
- [ ] 6.2 `git commit --allow-empty -m "test"` — pre-commit hook succeeds.
- [ ] 6.3 `adb devices` shows the emulator.
- [ ] 6.4 `adb shell ps -A | grep gardenplanner` shows the app's process.
- [ ] 6.5 `openspec validate make-app-runnable-on-android` — valid.
