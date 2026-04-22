## 1. OpenSpec artifacts

- [x] 1.1 Create change folder `openspec/changes/deliver-flows-docs-and-dev-command/`.
- [x] 1.2 Write `proposal.md`, `design.md`.
- [x] 1.3 Write spec deltas: `mobile-architecture`, `local-first-storage`, `reasoning-provider`, `inventory-tracking`, `yield-tracking`.
- [x] 1.4 Write `tasks.md` (this file).
- [x] 1.5 `openspec validate deliver-flows-docs-and-dev-command` — MUST pass.

## 2. `@garden/ui` — `TextInput` primitive

- [x] 2.1 Add `packages/ui/src/primitives/text-input.tsx` wrapping raw `react-native`'s `TextInput`. Props: `value`, `onChangeText`, `placeholder?`, `secureTextEntry?`, `keyboardType?`, `accessibilityLabel`. Manages focus state for border color. Label renders above as a `<Body muted>`.
- [x] 2.2 Export from `packages/ui/src/index.ts`.
- [x] 2.3 Extend `packages/ui/src/__mocks__/react-native.tsx` to stub the raw `TextInput` so `react-test-renderer` tests can find it by `accessibilityLabel`.
- [x] 2.4 Write TextInput tests in `packages/ui/src/primitives/__tests__/render.test.tsx` — asserts `onChangeText` forwards, focus toggles border token, `secureTextEntry` forwards.
- [x] 2.5 Extend `Caption` with a `variant` prop bound to `SummaryType` (Success / Warning / ActionRequired / Rejection) so forms can surface errors and confirmations consistently.

## 3. `@garden/memory` — `deleteSector` + `renameSector` + `listInventoryRecords`

- [x] 3.1 Add `deleteSector(id: string): Promise<void>`, `renameSector(id: string, name: string): Promise<void>`, `listInventoryRecords(): Promise<ReadonlyArray<InventoryRecord>>` to the `MemoryRepository` interface.
- [x] 3.2 Implement on the Node `better-sqlite3` adapter (`DELETE FROM sectors WHERE id = ?`, `UPDATE sectors SET name = ? WHERE id = ?`, `SELECT * FROM inventory_records ORDER BY acquired_at DESC`).
- [x] 3.3 Implement on the mobile in-memory adapter at `apps/mobile/src/core/query/repository.ts` (Map `delete` / entry replace / list values sorted).
- [x] 3.4 Add test cases in `packages/memory/src/__tests__/sector-harvest.test.ts` — rename in place + delete + re-delete is idempotent.
- [x] 3.5 Update `packages/engine/src/__tests__/_test-utils.ts`'s mock repo with the new methods.

## 4. Sectors tab — rename, delete, open

- [x] 4.1 Rewrite `apps/mobile/src/features/sectors/components/sectors-screen.tsx` — add-sector card with `TextInput` validation, list of sectors with an **Open** button per row.
- [x] 4.2 Rename is handled on the sector-detail screen (see 5.2): `TextInput` + Save button → `useRenameSector` mutation.
- [x] 4.3 Delete lives on the sector-detail screen's "Danger zone" card → `useDeleteSector` mutation → `router.back()`.
- [x] 4.4 **Open** calls `router.push('/sector/' + id)`.
- [x] 4.5 Empty names rejected in-UI with an `actionRequired` caption.

## 5. Sector detail route + harvest form

- [x] 5.1 Create `apps/mobile/app/sector/[id].tsx` (≤30 lines). Reads `id` via `useLocalSearchParams` and renders `<SectorDetailScreen id={id} />`.
- [x] 5.2 Create `apps/mobile/src/features/sectors/components/sector-detail-screen.tsx`. Header: sector name. Sections: back button, rename card, harvest-log form, recent-harvests list, danger-zone delete card.
- [x] 5.3 Create `apps/mobile/src/features/yield/components/harvest-form.tsx` — species picker + grams `TextInput` + submit button. Wires `MemoryRepository.appendHarvest` via `useAppendHarvest`.
- [x] 5.4 `useAppendHarvest` invalidates `["harvests", sectorId]`, `["heatmap"]`, and `["yield", sectorId]` on success so the Yield tab and sector list reflect the new row immediately.
- [x] 5.5 Invalid sector id renders "Sector not found" caption + back-to-sectors button.

## 6. Inventory tab — record + event forms

- [x] 6.1 Use the existing `EventKind` const in `@garden/config` (no new enum needed — Sowed/Transplanted/PestObserved/SoilSample/PlantFailure/Correction already defined).
- [x] 6.2 Create `apps/mobile/src/features/inventory/components/record-form.tsx` — kind pills, name/quantity/unit/supplier inputs, submit. Wires `saveInventoryRecord` via `useSaveInventoryRecord`.
- [x] 6.3 Create `apps/mobile/src/features/inventory/components/event-form.tsx` — kind pills, sector picker, species picker, note input, submit. Wires `appendEvent` via `useAppendEvent`. Empty-sectors-state renders a `Caption` actionRequired + button to the Sectors tab.
- [x] 6.4 Update `apps/mobile/src/features/inventory/components/inventory-screen.tsx` to compose both forms plus a recent-records + recent-events list.

## 7. Settings — Anthropic key + live theme

- [x] 7.1 Add `expo-clipboard@8.0.7` to `apps/mobile/package.json` dependencies.
- [x] 7.2 Create `apps/mobile/src/features/settings/hooks/use-anthropic-key.ts` — tanstack-query-backed, masks on read, wires `SecureStore.setItemAsync` / `deleteItemAsync` / `getItemAsync`.
- [x] 7.3 Create `apps/mobile/src/features/settings/components/anthropic-key-field.tsx` — `secureTextEntry` `TextInput`, paste `Button` via `expo-clipboard`, save/clear `Button`s, masked read-only state.
- [x] 7.4 `useAnthropicKey` flips `settingsStore.anthropicKeyConfigured` on save and clear.
- [x] 7.5 Refactor: keep `@garden/ui`'s `ThemeProvider` decoupled; create `apps/mobile/src/core/theme/settings-theme-provider.tsx` that subscribes to `settingsStore.themeId` via `zustand`'s `useStore` and passes the current id into `ThemeProvider`. (Spec delta updated — cleaner boundary.)
- [x] 7.6 Compose the new wrapper in `apps/mobile/app/_layout.tsx`; the inner `ThemeProvider` is not touched.
- [ ] 7.7 Verify theme live-switch on the emulator (manual — follows `pnpm dev`).

## 8. Component tests per flow

- [x] 8.1 TextInput tests — in `packages/ui/src/primitives/__tests__/render.test.tsx`.
- [x] 8.2 `apps/mobile/src/features/sectors/__tests__/sector-detail-screen.test.tsx` — renders header, shows not-found on missing id, rename persists.
- [x] 8.3 `apps/mobile/src/features/sectors/__tests__/sectors-screen.test.tsx` — empty-name rejection, add-sector persistence, Open pushes to `/sector/:id`.
- [x] 8.4 `apps/mobile/src/features/yield/__tests__/harvest-form.test.tsx` — species pick + grams + submit; empty/zero validation.
- [x] 8.5 `apps/mobile/src/features/inventory/__tests__/record-form.test.tsx` — name/quantity validation + successful submit.
- [x] 8.6 `apps/mobile/src/features/inventory/__tests__/event-form.test.tsx` — including empty-sectors state + sector-pick validation + successful submit.
- [x] 8.7 `apps/mobile/src/features/settings/__tests__/anthropic-key-field.test.tsx` — paste + save + mask + clear.
- [x] 8.8 Mocks: `apps/mobile/src/__mocks__/{react-native,react-native-safe-area-context,expo-router,expo-secure-store,expo-clipboard,@expo/vector-icons}.{tsx,ts}`. Jest config extended to match `*.test.tsx` and route RN/expo imports to these mocks.
- [x] 8.9 All new tests pass: `pnpm --filter apps-mobile run test` → 40/40, `pnpm --filter @garden/ui run test` → 63/63.

## 9. Docs (user-first + dev-first)

- [x] 9.1 `HOW-TO.md` at repo root — user-first: what the app does, every flow (add sector, log harvest, log inventory, paste Anthropic key, change theme). Short sentences, bullet-heavy.
- [x] 9.2 `SIDELOAD.md` at repo root — user-first: ten steps to enable Developer mode / USB debugging / install-from-unknown-sources / install the APK.
- [x] 9.3 `COMMANDS.md` at repo root — dev-first: every `pnpm …` root script + every `scripts/*.sh` + what it does + when to use it. Table layout.
- [x] 9.4 `docs/app-flow.md` — dev-first narrative: capture → verdict → sector → sow → harvest → rotation → nutrient. Explains the data model in order.
- [x] 9.5 Updated `README.md` to link HOW-TO, SIDELOAD, COMMANDS, app-flow, BUILDING, CLAUDE.md. Front-pages `pnpm dev`.
- [x] 9.6 Updated `QUICKSTART.md` with a TL;DR `pnpm dev` block at the top.
- [ ] 9.7 Capture the eight fresh screenshots under `docs/screenshots/` (manual — follows `pnpm dev`).

## 10. One-command dev launcher

- [x] 10.1 Wrote `scripts/dev.sh` per D6 in `design.md`. chmod +x.
- [x] 10.2 Wrote `scripts/dev-stop.sh` — kills Metro by PID file or `:8081` lsof, shuts down emulator via `adb emu kill`. chmod +x.
- [x] 10.3 Added root `package.json` scripts: `dev` → `bash scripts/dev.sh`, `dev:stop` → `bash scripts/dev-stop.sh`, `doctor` → `bash scripts/doctor.sh`, `apk` → `pnpm --filter apps-mobile run apk:local`.
- [x] 10.4 Documented `pnpm dev` + `pnpm dev:stop` + `pnpm apk` in `COMMANDS.md`.

## 11. Verification

- [x] 11.1 `pnpm check:all` — green (typecheck + lint + test + spell + format:check + audit:citations + audit:contrast).
- [x] 11.2 `pnpm --filter apps-mobile run test` — 40/40 passing (6 new component-test files + 6 pre-existing).
- [ ] 11.3 From a fresh terminal: `pnpm dev` — app boots, installs, Metro tails. (Manual, on the user's machine.)
- [ ] 11.4 On the emulator: add a sector, rename it, open it, log a harvest → Yield tab shows it. (Manual.)
- [ ] 11.5 Log an inventory record and an inventory event → Inventory tab lists both. (Manual.)
- [ ] 11.6 Paste a fake Anthropic key, save, clear → masked display cycles as specified. (Manual.)
- [ ] 11.7 Flip the theme in Settings → app re-renders immediately. (Manual.)
- [ ] 11.8 Capture a fresh screenshot per new flow under `docs/screenshots/`. (Manual.)
- [x] 11.9 `openspec validate deliver-flows-docs-and-dev-command` — valid.
- [ ] 11.10 `openspec archive deliver-flows-docs-and-dev-command` — pending user confirmation.
- [ ] 11.11 `git add -A && git commit` — pending user confirmation.
