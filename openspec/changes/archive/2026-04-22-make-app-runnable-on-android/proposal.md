## Why

User attempted `git commit . -m "initial commit"` and the pre-commit hook failed:

```
✖ ESLINT_USE_FLAT_CONFIG=false eslint --fix --max-warnings=0 failed without output (ENOENT).
✖ prettier --write failed without output (KILLED).
```

Two problems:

1. lint-staged v15 passes each command to `execa` **without a shell**. The leading `ENV=value` prefix in `"ESLINT_USE_FLAT_CONFIG=false eslint ..."` is parsed as the command name → ENOENT.
2. Running prettier across 65 JSON/MD/YAML files in a single initial-commit batch hit a resource limit → KILLED.

User also flagged: remaining `bootstrap-spatial-garden-planner` tasks were deferred (not closed) and the app has never actually been installed on a device. Both are release-blockers for the "this is a real app" test.

## What Changes

- **FIX** lint-staged to not rely on shell env-var prefixes. Install `cross-env`, re-declare each pipeline command through it. `cross-env` is cross-platform and works with lint-staged's no-shell execution model.
- **FIX** the hook's first-commit ergonomics: keep per-file scoping (already lint-staged's default), drop `--max-warnings=0` from the staged ESLint pass so warnings don't block a historically-first commit (CI still enforces the full lint).
- **ADD** a tighter `.prettierignore` to skip generated / large-binary paths (coverage reports, font TTFs, lcov output, turbo cache) so prettier never processes files it shouldn't.
- **ADD** a pre-commit smoke check: a tiny test commit on an empty diff to verify the hook completes. Added to `check-conventions` skill.
- **DO** actually boot the user's `Pixel_9` AVD, run `expo run:android` against it, fix whatever native-build errors surface, install the APK, and confirm the capture screen renders.
- **CLOSE** the remaining 29 tasks in `bootstrap-spatial-garden-planner`: walk each one, mark done with evidence (many are covered by `fix-bootstrap-gaps` work) or add the minimum code to finish.

## Capabilities

### Modified Capabilities

- `pre-commit-hygiene` — the env-var invocation contract changes (cross-env); warnings no longer block the staged lint run.
- `dev-environment` — adds a concrete "app runs on a device" requirement plus the native-build steps for `@shopify/react-native-skia` and `react-native-reanimated`.

### New Capabilities

- None — this change closes gaps in existing specs.

## Impact

- New devDep: `cross-env`.
- `package.json` `lint-staged` rewritten.
- `.prettierignore` gains entries for binary + generated paths.
- Native build steps for Skia / Reanimated enabled (pnpm `onlyBuiltDependencies`).
- `bootstrap-spatial-garden-planner/tasks.md` updated with closure evidence.
- A working `apk-release.apk` produced on disk and installed on the Pixel_9 AVD.
