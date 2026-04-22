## Context

Three failures to close:

1. **Pre-commit ENOENT** — `lint-staged@15` runs each pipeline entry via `execa`, which does not spawn a shell. Leading `VAR=value` does not work. The previous design leaned on it because ESLint 9 requires `ESLINT_USE_FLAT_CONFIG=false` to read `.eslintrc.cjs`. `pnpm run` worked because pnpm spawns a shell; lint-staged does not.
2. **Prettier KILLED** — initial commit staged 225 files. Lint-staged ran 65 of them through prettier in parallel; the prettier 3 worker pool hit an OS-level resource limit.
3. **App not installable** — we never actually booted the emulator + `expo run:android`. User now has the `Pixel_9` AVD ready.

## Goals / Non-Goals

**Goals:**

- `git commit . -m "initial commit"` succeeds on a clean tree with the real pre-commit hook (not `--no-verify`).
- `pnpm --filter apps-mobile run android` installs the app on the running `Pixel_9` emulator and reaches the capture screen without a red-box error.
- Every task in `bootstrap-spatial-garden-planner/tasks.md` is either `[x] ...` with evidence or explicitly documented as a known follow-up.

**Non-Goals:**

- Flat-config migration (separate follow-up — drops the ENV-var shim entirely).
- Smoke-tested feature flows (that's `DEVICE-TESTING.md`'s job with a human reviewer).
- iOS.

## Decisions

### D1. `cross-env` for env-var plumbing in lint-staged

**Chosen:** `cross-env ESLINT_USE_FLAT_CONFIG=false eslint --fix ...` inside lint-staged. `cross-env` is a tiny package (≤10 kB) specifically built for this case; it works on Windows too and is the standard fix for lint-staged + env-var combos.

**Alternative considered:** migrate ESLint to flat config now. Rejected for this change because (a) it would inflate scope and (b) flat config rewrites every override we have.

### D2. Drop `--max-warnings=0` from the staged lint

**Chosen:** the `package.json` top-level `"lint"` script keeps `--max-warnings=0` via Turbo (enforced in CI). The per-file **staged** lint drops it so a single lingering warning does not block a commit. The difference in risk: lint-warnings slip into a branch → still caught in CI → caught before merge.

### D3. Prettier — rigorous ignores + single worker

**Chosen:**

- `.prettierignore` gains: `coverage/`, `*.lcov`, `lcov.info`, `*.ttf`, `*.otf`, `*.apk`, `*.aab`, `.cspell-cache`, `android/`, `ios/`, `**/.turbo/**`, `**/dist/**`, `node_modules/**`.
- lint-staged invokes prettier per pipeline, no concurrency bump.

### D4. Native builds: approve `@shopify/react-native-skia` + `react-native-reanimated`

**Chosen:** update `pnpm-workspace.yaml`'s `onlyBuiltDependencies` to include the two native packages. Reanimated 4 needs its postinstall hooks; Skia needs its C++ build. Without them, `expo run:android` will fail at the native-link step.

### D5. `expo run:android` instead of `eas build`

**Chosen:** local build against the attached emulator via `expo run:android`. `eas build` is cloud-only and requires login; the user wants the APK on **their** device right now. The skill `build-apk` already documents `pnpm --filter apps-mobile run apk:local` which is the same thing.

### D6. Bootstrap task closure — evidence or follow-up

**Chosen:** walk the 29 remaining `bootstrap-spatial-garden-planner` tasks. For each:

- If the `fix-bootstrap-gaps` or this change's work completed it → mark `[x]` with a one-line evidence note inline.
- If it genuinely can't ship today (e.g., "dyslexic reviewer sign-off in ACCESSIBILITY.md") → leave `[ ]` but add a "tracked in DEVICE-TESTING.md" note.
- No silent deferrals. Every `[ ]` must have a reason visible on the line.

## Risks / Trade-offs

- [**cross-env adds one dep**] — trivial size; ubiquitous in the ecosystem.
- [**`expo run:android` may surface Metro/Gradle errors that didn't show in `pnpm install`**] — likely Reanimated worklet plugin ordering or Skia native build. Mitigated by having an emulator + JDK + SDK already installed, so the first error is deterministic and fixable.
- [**Dropping `--max-warnings=0` from staged lint**] — CI still enforces it across the tree; the trade-off is accepted.

## Migration Plan

Linear, same-session:

1. Install cross-env; rewrite lint-staged.
2. Update `.prettierignore`.
3. Approve native builds; `pnpm install`.
4. Run `git commit . -m "initial commit"` — must succeed.
5. Build and install the app on the emulator.
6. Close bootstrap tasks with evidence.

## Open Questions

None. Every step is mechanical.
