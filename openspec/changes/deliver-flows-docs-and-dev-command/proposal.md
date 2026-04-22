## Why

User review of the running app surfaced that the UI renders but does nothing real:

- The **Inventory** screen has no log form. You cannot record seeds, seedlings, tools, or any event.
- The **Sectors** screen can only "Add Bed N" with a hard-coded polygon — no rename, delete, or detail.
- There is no way to log a **harvest** from anywhere.
- **Settings** exposes theme/font toggles but no Anthropic-key input, and flipping the theme does not re-render the app.
- Documentation is developer-first (`BUILDING.md`). No user-facing HOW-TO. No plain-English sideload walkthrough. No single-page commands cheat-sheet.
- Running the app requires memorising `pnpm -F apps-mobile run start` + `adb reverse tcp:8081 tcp:8081` + emulator boot — a three-year RN veteran still can't run it with one command.

This change closes **all three** gaps in one shot: real user flows (A), user-first docs (B), and a one-command dev launcher (C).

## What Changes

### A — Real user flows

- **NEW** `TextInput` primitive in `@garden/ui` (themed, Lexend, AA-contrast border, supports `secureTextEntry`).
- **NEW** `MemoryRepository.deleteSector(id)` on the interface, the Node `better-sqlite3` adapter, and the mobile in-memory adapter.
- **NEW** Sector editor flow: the Sectors tab lists sectors with rename + delete + "open" actions. "+" prompts for a name; blank names are rejected in-UI.
- **NEW** Sector-detail route at `app/sector/[id].tsx` — shows the sector's history + a "Log harvest" form (species picker, weight-grams input, submit wires `appendHarvest`). The Yield tab updates immediately.
- **NEW** Inventory-record form on the Inventory tab: kind (Seed / Plant / Tool / Amendment), name, quantity, unit, source supplier (optional). Submit wires `saveInventoryRecord`.
- **NEW** Inventory-event form: kind (Sowed / Transplanted / Pest observed / Soil sample / Plant failure / Correction), tied to a sector picker and an optional species picker.
- **NEW** Settings — Anthropic key field with `secureTextEntry`, "Paste from clipboard" button (via `expo-clipboard`), and Save button. The key is persisted to `expo-secure-store`. After save, the field shows `sk-ant-***…***` masked and offers "Clear key". `anthropicKeyConfigured` flips in the settings store.
- **MODIFIED** `ThemeProvider` is now driven by the `settingsStore.themeId` Zustand selector. Flipping the theme in Settings re-renders the whole app immediately (the stated intent of the accessibility spec).

### B — Docs

- **NEW** `HOW-TO.md` — user-first. "What the app does." "How I log a harvest." "How I change the theme." With the existing tab screenshots inline. Short, dyslexia-friendly prose.
- **NEW** `SIDELOAD.md` — dead-simple Android-phone sideload. Developer-mode toggle, USB-debug toggle, install unknown apps toggle, `adb install`. ≤10 steps, same tone as HOW-TO.
- **NEW** `COMMANDS.md` — a single-page developer cheat sheet: every `pnpm …` script at the repo root, every `./scripts/*.sh`, what each does, when to use it.
- **NEW** `docs/app-flow.md` — the narrative: capture → verdict → sector → sow → harvest → rotation → nutrient. The "what the app's data model does in order" reference.
- **MODIFIED** `README.md` and `BUILDING.md` link the new docs.

### C — One command

- **NEW** `scripts/dev.sh` — orchestrator: sources `setup-env.sh`, runs `doctor.sh`, boots the AVD if no device, re-establishes `adb reverse tcp:8081 tcp:8081`, starts Metro in background, runs `expo run:android --no-bundler`, tails Metro log in the foreground.
- **NEW** Root-level scripts: `pnpm dev` (→ `scripts/dev.sh`), `pnpm apk` (→ local gradle APK build, replaces the old turbo-cached variant), `pnpm doctor` (→ `scripts/doctor.sh`).
- **MODIFIED** `README.md` and `QUICKSTART.md` front-page `pnpm dev` as the single command.

## Capabilities

### Modified Capabilities

- `mobile-architecture` — adds the `/sector/[id]` route, the settings-store-driven ThemeProvider, and the `pnpm dev` one-command requirement.
- `local-first-storage` — adds `deleteSector` to `MemoryRepository`.
- `reasoning-provider` — adds the concrete Anthropic-key paste+save flow on device (Settings form).
- `inventory-tracking` — adds the UI contract for logging records and events.
- `yield-tracking` — adds the UI contract for logging a harvest from a sector.

### New Capabilities

- None. Every piece below sits inside an existing capability.

## Impact

- **New deps in `apps/mobile`**: `expo-clipboard` (paste button). No other runtime additions.
- **New root scripts**: `pnpm dev`, `pnpm apk`, `pnpm doctor`.
- **New user docs**: 4 files added, 2 modified.
- **Breaking**: none for consumers; the `ThemeProvider` prop `themeId` becomes optional and defaults to the settings-store value.
- **Non-goals for this change**:
  - Live `expo-camera` feed on Capture (tracked: `make-capture-driver`).
  - expo-sqlite persistence (tracked: `make-device-sqlite-adapter`).
  - Polygon editor / map for sector geometry — sectors still use a placeholder polygon unless the user draws on a map, which is out of scope here.
  - Bulgarian translation content.
