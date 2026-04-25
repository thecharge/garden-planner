## 1. Audit & Preparation

- [x] 1.1 Read `apps/mobile/metro.config.js` (or `metro.config.ts`) and confirm whether `better-sqlite3` is already block-listed; if not, add it to `resolver.blockList` to prevent Metro from attempting to bundle the Node-only adapter
- [x] 1.2 Read `packages/memory/src/factory.ts` and confirm that the `createBetterSqliteAdapter` import is conditional / guard-wrapped for device mode — if the top-level import is unconditional, refactor to a lazy `await import()` inside the `in-memory` and `file` branches only (keeping the device branch pure)
- [x] 1.3 Confirm `expo-sqlite` version in `apps/mobile/package.json` supports `openDatabaseAsync` / `execAsync` / `runAsync` / `getAllAsync` / `getFirstAsync` (SDK 50+ async API)

## 2. expo-sqlite Adapter

- [x] 2.1 Create directory `apps/mobile/src/core/storage/`
- [x] 2.2 Create `apps/mobile/src/core/storage/expo-sqlite-adapter.ts` — export `createExpoSqliteAdapter(db: SQLiteDatabase): SqliteLike` implementing all five methods (`exec`, `run`, `all`, `get`, `close`) wrapping expo-sqlite's async API; catch all errors and re-throw as `SmepErrors.repositoryUnavailable()` — no `as any`, no `@ts-ignore`, no `require()`
- [x] 2.3 Export `createExpoSqliteAdapter` from `apps/mobile/src/core/storage/index.ts` (create `index.ts`)

## 3. Unit Tests for the Adapter

- [x] 3.1 Create `apps/mobile/src/core/storage/__tests__/expo-sqlite-adapter.test.ts` — mock `expo-sqlite` with `jest.mock`; write `it.each` table covering: Happy (exec/run/all/get/close succeed), Side (get returns undefined when `getFirstAsync` returns null), Critical (`null` db handle throws `SmepErrors.repositoryUnavailable`), Chaos (each method rejects — verify typed error is thrown)

## 4. Wire Adapter into Repository Bootstrap

- [x] 4.1 Update `apps/mobile/src/core/query/repository.ts`: replace `createInMemoryRepository()` with an `async` bootstrap that calls `openDatabaseAsync('garden.db')`, wraps the handle in `createExpoSqliteAdapter`, calls `createMemoryRepository({ mode: 'device', sqlite: adapter })`, and stores the result in the `instance` singleton — migrations are run automatically by `buildRepository` inside `@garden/memory`
- [x] 4.2 Verify `__resetMemoryRepositoryForTests` still compiles and correctly resets the singleton to `null`
- [x] 4.3 Audit any direct callers of `getMemoryRepository()` in `apps/mobile/src/` that do not await the promise — fix if found

## 5. Full Gate

- [x] 5.1 Run `pnpm turbo run typecheck lint test` — all packages must pass with zero errors
- [x] 5.2 Fix any typecheck or lint errors surfaced by the gate

## 6. Device Proof

- [x] 6.1 Boot emulator via `./scripts/launch-emulator.sh`
- [x] 6.2 Install debug build via `pnpm dev`
- [x] 6.3 Grant permissions via `scripts/adb-ui.sh grant`
- [x] 6.4 Navigate to the Sectors tab via `scripts/adb-ui.sh tap-tab sectors` (or the relevant tab label) and create a test sector through the UI
- [x] 6.5 Force-stop and relaunch the app to confirm the sector persists across restart
- [x] 6.6 Capture proof screenshot via `scripts/adb-ui.sh shot sectors-after-sqlite-migration` → `docs/screenshots/sectors-after-sqlite-migration.png`
- [x] 6.7 Run `scripts/adb-ui.sh alive` — must print `PID=<n>`
- [x] 6.8 Verify the screenshot is not a black frame (file size must be > 30 KB); commit `docs/screenshots/sectors-after-sqlite-migration.png` alongside code changes
