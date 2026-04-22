# Garden Planner

A local-first, voice-led, accessibility-first spatial garden planner.

Made first for home growers and small farmers in **Chepinci (Sofia basin, Bulgaria)**. Side-loaded as an Android `.apk`. Voice in, whisper out, camera maps the yard. Remembers sectors, year-over-year yield, and what the science says to rotate into next spring.

## What makes this different

A standard SaaS garden planner lets you drag cartoon trees over a 2D grid and assumes your soil is perfect and your climate average. This one negotiates the real plot you are standing on — its slope, its water table, its legal setbacks — and keeps a permanent record of what grew, where, and how well.

- **Spatial capture** — pan the camera, get a `Protocol` (slope, orientation, water-table depth, confidence).
- **Compliance engine** — Sofia-basin setback / slope / water-table rules; every verdict cites its source.
- **Rotation + nutrient advisor** — science-backed (crop families, Liebig's Law, FAO-56 Penman-Monteith ET₀).
- **Voice-first, always-captioned** — earbuds in, phone in pocket; captions for every spoken word.
- **Accessibility as baseline** — neutral pastel + dark + AAA high-contrast; Lexend default / OpenDyslexic opt-in; cross-modal redundancy.
- **Local-first, BYOK** — SQLite on device; Anthropic key in `expo-secure-store`; nothing leaves the phone without consent.

## Architecture at a glance

```
/
├── packages/
│   ├── config/    @garden/config   — enums, SpatialLimits, SmepErrors factory, shared types
│   ├── core/      @garden/core     — Protocol, summary, event factories, FAO-56 ET₀, pH availability
│   ├── memory/    @garden/memory   — SQLite MemoryRepository (better-sqlite3 in Node, expo-sqlite on device)
│   ├── engine/    @garden/engine   — compliance rules, species matcher, rotation advisor,
│   │                                  nutrient/irrigation advisor, reasoning adapter (Anthropic)
│   └── ui/        @garden/ui       — theme tokens (light / dark / AAA), Paper theme mapper,
│                                      announce() helper (TTS + caption + haptic), contrast auditor
├── apps/
│   └── mobile/                     — Expo Android app (Feature-Sliced Design: app/ + src/core + src/engine + src/features)
├── openspec/                       — spec-driven design artifacts for every change
├── turbo.json                      — build / typecheck / lint / test / apk pipelines
└── tsconfig.base.json              — strict TS with @garden/* path aliases
```

The four "pure" packages (`config`, `core`, `memory`, `engine`) contain **zero React Native / Expo imports** and test in plain Node. A lint rule enforces this. The UI package and the mobile app are the only places Expo / Paper / RN appear.

## Hard rules (enforced by ESLint, not by review)

These are the rules every `.ts` file obeys. Violations fail CI.

- **Imports by package name only** — `@garden/core`, never `../../packages/core/src/index`.
- **≤300 lines per file**.
- **Max 2 nesting levels** (early returns / early continues).
- **No `else if`**, **no `switch`/`case`**, **no `function` declarations** — const arrow functions only.
- **No `.js` extensions on imports**.
- **No `new Error(...)` outside `@garden/config`** — always `throw SmepErrors.xxx()`.
- **Enums from `@garden/config`** — `TaskStatus.VERIFIED`, never `"verified"`.
- **Types in `@garden/config`** — all shared types live there.
- **Every science-data entry carries `sourceCitation`** — CI fails on missing citations.
- **Every theme foreground/background pair meets WCAG AA (AAA for `high-contrast`)** — CI fails on regression.
- **No Redux, no Redux Toolkit, no Redux Saga** — TanStack Query + Zustand only. CI greps `package.json` to enforce.

## Testing philosophy

Every engine module ships with a Jest `it.each` table covering **happy / side / critical / chaos** paths.

- **Happy** — the common, well-formed input.
- **Side** — an alternate real-world shape that still resolves.
- **Critical** — a constraint-breaching input that must be rejected.
- **Chaos** — malformed input (`null`, non-finite, missing field) that must throw a typed `SmepError`.

Run everything locally:

```bash
pnpm install
pnpm turbo run typecheck lint test
pnpm --filter @garden/engine run audit:citations
pnpm --filter @garden/ui run audit:contrast
```

## The Expo app

Lives in `apps/mobile/`. Built with Expo Router (thin glue in `app/`) and a **Feature-Sliced Design** layout under `src/`:

```
apps/mobile/src/
├── core/         config, logger, TanStack Query client, theme bridge
├── engine/       spatial store (Zustand transient 60 Hz pose), capture driver,
│                 Reanimated worklets, Skia overlays
└── features/     self-contained feature silos, each with
                  components/ hooks/ store/ types/ index.ts
```

A feature silo is deletable (minus its route) without breaking the rest of the app. Cross-feature imports only through the feature's `index.ts`.

**State:** TanStack Query for everything through `MemoryRepository` and the reasoning provider; Zustand for client UI state; a Zustand **transient** store for the 60 Hz spatial pose (so capture does not melt React's render loop). Reanimated worklets and Skia canvas read from the transient store directly.

**Accessibility pattern:** every spoken utterance is also a persistent caption *and* a haptic buzz. `announce(summary)` in `@garden/ui` is the single point where this contract is enforced. Invisible transparent `View`s overlaid on spatial objects let TalkBack focus 3D things.

## Where the docs go

- **[QUICKSTART.md](QUICKSTART.md)** — clone → sideload `.apk` → first scan, ten steps.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — reviewer sign-off ledger (dyslexia / low-vision / deaf-or-HOH). Release gate.
- **[openspec/changes/](openspec/changes/)** — the spec-driven design trail for every change, including `bootstrap-spatial-garden-planner`.

## License

MIT.
