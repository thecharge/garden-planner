## Why

The app currently persists all garden data in an in-memory `Map` shim (`apps/mobile/src/core/query/repository.ts`), meaning every app restart wipes the user's sectors, yield records, and rotation history. `packages/memory` already contains a full SQL-backed `MemoryRepository` and a migration runner — the only gap is an `expo-sqlite → SqliteLike` adapter to bridge the device's native SQLite engine to that interface.

## What Changes

- **New file** `apps/mobile/src/core/storage/expo-sqlite-adapter.ts`: implements the `SqliteLike` async interface using `expo-sqlite`'s `openDatabaseAsync` / `execAsync` / `runAsync` / `getAllAsync` / `getFirstAsync` API.
- **Replace** `apps/mobile/src/core/query/repository.ts`: swap the in-memory `Map` construction for `createMemoryRepository({ mode: 'device', sqlite: expoSqliteAdapter })` and run the migration runner at DB-open time before exposing the repository.
- **New tests** `apps/mobile/src/core/storage/__tests__/expo-sqlite-adapter.test.ts`: unit-test the adapter with a mocked `expo-sqlite` module (Happy / Side / Critical / Chaos table).

## Capabilities

### New Capabilities

- `device-sqlite-adapter`: An `expo-sqlite`-backed implementation of the `SqliteLike` interface that lets `@garden/memory`'s repository run on-device with durable SQLite storage.

### Modified Capabilities

- `local-first-storage`: The repository bootstrapping in the mobile app now opens a real SQLite file and runs schema migrations on first launch, fulfilling the durable-storage requirement that was previously deferred.

## Impact

- **`apps/mobile/src/core/query/repository.ts`** — factory call changes; module now async (returns a `Promise<MemoryRepository>`).
- **`apps/mobile/src/core/storage/`** — new directory; new adapter file + tests.
- **`@garden/memory`** — consumed as-is; no changes to the package.
- **`expo-sqlite`** — already a listed dependency; no new packages required.
- **`expo-secure-store`** usage for the Anthropic API key is untouched.
- All callers of the repository singleton may need to `await` the bootstrap promise if they do not already go through TanStack Query hooks (audit required in tasks).
