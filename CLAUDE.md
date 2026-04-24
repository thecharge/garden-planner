# CLAUDE.md

Guidance for Claude Code (and any other AI assistant) working in this repo. Treat this file as non-negotiable context.

## What this repo is

A local-first, voice-led, accessibility-first spatial garden planner for small home growers and farmers in Chepinci (Sofia basin, Bulgaria). Built as an Expo Android app over a pure-TypeScript engine in a pnpm + Turborepo monorepo.

See `README.md` for the feature-level overview, `BUILDING.md` for setup, `ACCESSIBILITY.md` for the a11y release gate.

## Hard rules — failing any one of these fails CI

These are not suggestions. Lint, typecheck, cspell, and the custom `no-restricted-syntax` rule all enforce them. Do not bypass with `eslint-disable` or `// @ts-ignore` unless you have a load-bearing reason and document it inline.

### Code conventions

- **Imports by package name only.** `@garden/config`, never `../../packages/config/src/index`.
- **≤300 lines per file.** Split when approaching the limit.
- **Max 2 nesting levels.** Extract helpers or use early return.
- **No `else if`.** Use early return / continue.
- **No `switch`/`case`.** Use early returns with `if`.
- **No `function` declarations.** Const arrow only: `export const fn = async () => {};`.
- **No `.js` extensions in imports.** `from "./parser"` not `from "./parser.js"`.
- **No `new Error(...)` outside `@garden/config`.** Throw via `SmepErrors.xxx()`.
- **Enums from `@garden/config`.** `TaskStatus.Verified`, never the raw string `"VERIFIED"`.
- **All shared types in `@garden/config`.** One source of truth.
- **No Redux, no Redux Toolkit, no Redux Saga.** TanStack Query + Zustand only.
- **Accessibility primitives via `@garden/ui`.** Never import `react-native-paper` directly from `apps/mobile`.
- **Descriptive variable names.** `memoryRepository` not `mem`.

### String-literal unions are forbidden

Not a style preference — a **hard rule**. `type X = "A" | "B";` fails lint immediately.

Required pattern (PascalCase keys, SCREAMING_SNAKE_CASE values for codes / kebab-case for settings ids):

```ts
export const RotationReasonCode = {
  SameFamilyTooSoon: "SAME_FAMILY_TOO_SOON",
  LegumeNitrogenCarryover: "LEGUME_NITROGEN_CARRYOVER"
} as const;
export type RotationReasonCode = (typeof RotationReasonCode)[keyof typeof RotationReasonCode];

// Call sites:
reason.code === RotationReasonCode.SameFamilyTooSoon; // ✓
reason.code === "SAME_FAMILY_TOO_SOON"; // ✗ — raw literal comparison flagged
```

Shared domain enums live in `packages/config/src/enums.ts`. Single-package enums stay next to their consumer (e.g., `LogLevel` in `apps/mobile/src/core/log-level.ts`).

Tests may use narrow local unions for tuple types (lint exempts them) — but prefer `const + type` even in tests when practical.

### Accessibility is a release gate

- Neutral pastel palette (light + dark) with AAA high-contrast toggle; contrast audited in CI.
- Lexend default, OpenDyslexic opt-in; body text ≥18 sp, line height ≥1.55.
- Cross-modal redundancy: every verdict fires TTS + caption + haptic via `announce()` in `@garden/ui`.
- Plain-language copy: short sentences, active voice, no unexplained jargon.
- Never convey state by color alone.
- Expensive sensors (camera, location stream) must be gated on `useIsFocused()` from `expo-router` so they unmount when the tab blurs. Capture screen is the canonical example — `<CameraView>` also sits behind an explicit opt-in toggle so the app can be opened on the Capture tab without streaming a frame.

See `ACCESSIBILITY.md` for the reviewer sign-off ledger (release is blocked until filled).

### Verifying a UI change on device — mandatory

**No UI change lands without a proof screenshot captured from the running app.** Component tests prove the render tree; they do not prove the screen works on the device. The workflow is:

1. Have a device or emulator attached (`./scripts/launch-emulator.sh` or plug in a phone).
2. Install the APK (`pnpm dev` for debug + hot reload, `pnpm sideload` for the release APK).
3. Drive + capture via `scripts/adb-ui.sh` — see the `adb-ui-ops` skill.
4. Commit the proof PNGs to `docs/screenshots/` alongside the code change and reference them from `docs/STATUS.md`.

**Never** hand-guess pixel coordinates from a scaled screenshot. Use the label-based resolver:

```bash
scripts/adb-ui.sh tap "Open viewfinder"        # resolves content-desc or text via uiautomator
scripts/adb-ui.sh tap-tab capture              # deep-links the tab (more reliable than a tab-bar tap)
scripts/adb-ui.sh shot capture-verdict         # → docs/screenshots/capture-verdict.png
scripts/adb-ui.sh alive                        # "PID=<n>" — must print this after a stress sequence
scripts/adb-ui.sh watch 60                     # scoped crash watcher (FATAL / OOM / app-died)
```

A screenshot under ~30 KB is almost always a black frame: the app crashed or the GPU hadn't rendered. `Read` every proof PNG before you commit it, and always pair it with `alive` to catch an OOM-then-restart that left the PID slot reused.

## Architecture (pnpm workspaces + Turborepo)

```
packages/
  config/    @garden/config   enums + constants + SmepErrors + shared types
  core/      @garden/core     Protocol, summary, events, FAO-56 ET₀, pH curves
  memory/    @garden/memory   SqliteLike + MemoryRepository (better-sqlite3 in Node; expo-sqlite on device)
  engine/    @garden/engine   compliance, species matcher, rotation advisor,
                              nutrient/irrigation advisor, reasoning (Anthropic)
  ui/        @garden/ui       theme tokens, Paper-theme mapper, announce(), contrast auditor

apps/
  mobile/    Expo Android app (Feature-Sliced Design)
    app/          Expo Router glue (≤30 lines/file; no business logic)
    src/core/     config, log-level, logger, query client, i18n, theme bridge
    src/engine/   spatial store (Zustand transient), pose throttle, capture driver, Reanimated, Skia
    src/features/ capture, sectors, yield, rotation, nutrient, inventory, voice, a11y, overlay, settings

scripts/       setup-env / doctor / create-avd / launch-emulator / dev / sideload / adb-ui
openspec/      spec-driven design trail — every change lives in openspec/changes/
```

## Commands

### One-time setup

```bash
. ./scripts/setup-env.sh       # exports JAVA_HOME + ANDROID_HOME + PATH
./scripts/doctor.sh            # verify toolchain is OK
pnpm install
```

### Day-to-day

```bash
pnpm turbo run typecheck lint test      # full gate
pnpm test:coverage                      # per-package coverage reports
pnpm spell                              # cspell over .ts/.tsx/.md
pnpm audit:deps                         # pnpm audit, high+ (non-blocking)
pnpm audit:citations                    # fail if any @garden/engine data entry lacks sourceCitation
pnpm audit:contrast                     # fail if any @garden/ui theme pair drops below WCAG AA / AAA
pnpm check:all                          # the lot (the same CI gate)
```

### Run the app

```bash
./scripts/launch-emulator.sh            # boot the default Pixel_6_API_35 AVD
pnpm dev                                # debug build + Metro + tail. Prefers phone > emulator.
pnpm dev release                        # install the prebuilt release APK, skip Metro
pnpm dev:stop                           # kill Metro + emulator
pnpm sideload                           # install the release APK on the first real phone (USB)
pnpm apk                                # build the release APK (no install)
```

`pnpm dev` picks a real phone over the emulator when both are attached. The Metro log is at `/tmp/garden-metro.log`; Ctrl+C stops the tail but keeps Metro alive so hot-reload survives between runs. Emulator AVD config is pre-tuned for camera workloads (3 GB RAM, 512 MB heap, `gpu host`) — the launcher passes `-memory 3072 -gpu host` as a backstop for older AVDs.

### Drive the running app

```bash
scripts/adb-ui.sh grant                 # grant camera + location runtime perms
scripts/adb-ui.sh tap-tab capture       # switch tabs via deep-link
scripts/adb-ui.sh tap "Open viewfinder" # tap by content-desc or visible text
scripts/adb-ui.sh shot capture-verdict  # → docs/screenshots/capture-verdict.png
scripts/adb-ui.sh alive                 # "PID=<n>" or exit 1
scripts/adb-ui.sh watch 60              # scoped FATAL / OOM / app-died watcher
```

### OpenSpec

```bash
openspec list                                   # all changes
openspec status --change fix-bootstrap-gaps     # progress of a given change
openspec validate fix-bootstrap-gaps            # schema check
```

## Where to put new code

- **Domain primitive** (new enum, error, type) → `packages/config/src/{enums,errors,types/}`.
- **Pure domain logic** (rules, matchers, aggregators) → `packages/engine/src/`.
- **New `MemoryRepository` method** → `packages/memory/src/` + a migration under `migrations/` if schema changes.
- **New accessible UI primitive** → `packages/ui/src/primitives/` (wrap Paper; re-export from `src/index.ts`).
- **New mobile feature** → `apps/mobile/src/features/<feature>/` with `components/`, `hooks/`, `store/`, `types/`, and an `index.ts` public surface. **Cross-feature imports only through `index.ts`.**
- **New runtime constant** → `apps/mobile/src/core/config.ts`. Magic numbers / strings in feature code fail lint.

## Testing philosophy

Every pure-engine module ships with a Jest `it.each` table covering:

- **Happy** — the common, well-formed input.
- **Side** — an alternate real-world shape that still resolves.
- **Critical** — a constraint-breaching input that must be rejected via `SmepError`.
- **Chaos** — malformed input that must throw a typed error (never `new Error`).

Run with `pnpm --filter <pkg> run test` or `pnpm test:coverage` for per-package HTML reports under `coverage/lcov-report/index.html`.

## Skills available to Claude Code

Under `.claude/skills/`:

- `launch-emulator/` — source setup-env, boot AVD, verify adb.
- `adb-ui-ops/` — drive the running app: tap by label, screenshot for proof, deep-link tabs, grant perms, watch for crashes. Required reading before verifying any UI change.
- `run-tests-with-coverage/` — run coverage, open the HTML report path.
- `build-apk/` — local prebuild + gradle APK build.
- `check-conventions/` — single pre-PR gate (unions, lint, cspell, citations, contrast).

Plus OpenSpec workflow skills (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`).

## Open questions (tracked in OpenSpec changes, not here)

- Offline STT library choice (Vosk?).
- Chepinci cadastral polygon source.
- Agronomist reviewer for `packages/engine/src/data/species.ts` + `nutrient/species-demand.ts`.
- Native BG translator reviewer (see `ACCESSIBILITY.md`).

## Never do

- Bypass the union-ban lint with `eslint-disable`. Convert the union to a const-object pair.
- Import `react-native-paper` from `apps/mobile`. Add a primitive to `@garden/ui` and import from there.
- Introduce a magic number or user-facing string literal in feature code. Put it in `core/config.ts` or `locales/en.ts`.
- Merge a PR that drops a theme token's contrast below its threshold.
- Commit a font file without listing its OFL source in `apps/mobile/assets/fonts/LICENSES.md`.
- Hand-guess tap coordinates from a screenshot. Use `scripts/adb-ui.sh tap "<label>"` or `tap-tab <name>`.
- Claim a UI change is done without a proof screenshot in `docs/screenshots/` and an `alive` check. Rendered ≠ survives; a black 23 KB PNG is a crash, not a build.
- Mount `<CameraView>` (or any other heavy sensor surface) without `useIsFocused()` gating. The emulator's OOM killer will find you.
