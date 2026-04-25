## Context

`apps/mobile` currently boots with an in-memory `Map`-backed `MemoryRepository` shim. This was a deliberate deferral: `@garden/memory`'s Node path imports `better-sqlite3` (a native module that references `fs`) which cannot bundle through Metro. The package already has a device mode — `createMemoryRepository({ mode: 'device', sqlite })` — that accepts any `SqliteLike` adapter; the only missing piece is a thin wrapper around `expo-sqlite`'s async API to satisfy that interface.

`expo-sqlite` is already in the dependency tree. The `SqliteLike` interface is fully async (`Promise`-returning), matching expo-sqlite's native `*Async` methods directly. The `better-sqlite3` adapter is a proven reference showing exactly how to structure error handling and parameter forwarding.

## Goals / Non-Goals

**Goals:**

- Implement `SqliteLike` using `expo-sqlite`'s `openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`.
- Replace the Map shim in `repository.ts` with `createMemoryRepository({ mode: 'device', sqlite })`.
- Run schema migrations automatically at DB-open time before any repository method is called.
- Unit-test the adapter with a mocked `expo-sqlite` module (Happy / Side / Critical / Chaos).
- Pass full typecheck + lint + test gate.
- Capture a proof screenshot showing sectors persisting across app restart on emulator.

**Non-Goals:**

- Changes to `@garden/memory` (consumed as-is).
- Database encryption or keychain-backed DB keys.
- Migrating existing in-memory data to SQLite (clean start is acceptable; users have no stored data yet).
- Changes to `expo-secure-store` usage for the Anthropic key.
- iOS support changes (Android-only project).

## Decisions

### D1 — Adapter lives in `apps/mobile/src/core/storage/`, not in `@garden/memory`

**Decision**: Create `expo-sqlite-adapter.ts` inside the mobile app rather than adding an optional peer-dep adapter to `@garden/memory`.

**Rationale**: `@garden/memory` is intentionally Expo-free so it can be tested under Node with `better-sqlite3`. Keeping `expo-sqlite` imports confined to the mobile app maintains that boundary and avoids adding an Expo peer-dep to a pure-TS package. The `SqliteLike` interface is the clean seam — the adapter is an app-layer concern.

**Alternative considered**: Export an `expo-sqlite-adapter` from `@garden/memory/adapters/expo`. Rejected because it would force `expo-sqlite` into a Node package, breaking the test harness.

### D2 — Single shared DB handle, opened once at bootstrap

**Decision**: Open the database once during app bootstrap (in the `getMemoryRepository` singleton path), store the resolved `MemoryRepository` promise, and return the same instance to all callers.

**Rationale**: `expo-sqlite` docs recommend a single handle per database file. Opening multiple handles to the same file causes locking contention. The existing singleton pattern in `repository.ts` already enforces this; the upgrade replaces the synchronous `Map` construction with an awaited `createMemoryRepository` call.

**Alternative considered**: Per-query handle open/close. Rejected — SQLite is designed for long-lived handles and the overhead of open/close per query would be measurable.

### D3 — Migration runs inside the adapter factory, not inside `buildRepository`

**Decision**: `apps/mobile`'s `getMemoryRepository` calls `createMemoryRepository({ mode: 'device', sqlite })` which internally calls `buildRepository(sqlite)`. `buildRepository` already runs `runMigrations` before returning — no extra migration call is needed in app code.

**Rationale**: Checking the existing `buildRepository` source confirms migrations are already triggered there. This keeps the migration responsibility inside `@garden/memory` where it belongs and avoids duplicating the logic in app bootstrap code.

### D4 — Error handling mirrors the `better-sqlite3` adapter

**Decision**: Catch all exceptions from `expo-sqlite` and re-throw as `SmepErrors.repositoryUnavailable()`.

**Rationale**: Callers depend on typed `SmepError` throws, not raw `expo-sqlite` error objects. Consistent with the Node adapter and with the project's hard rule against `new Error()` outside `@garden/config`.

## Risks / Trade-offs

- **Migration failure on first launch** → If the schema migration throws, `getMemoryRepository` rejects and the app has no repository. Mitigation: the migration runner in `@garden/memory` is already covered by unit tests; the integration test (task 4) will catch regressions. The adapter wraps with `SmepErrors.repositoryUnavailable()` so callers receive a typed error rather than an unhandled rejection.
- **`expo-sqlite` API surface changes between SDK versions** → The adapter targets the async API introduced in SDK 50 (`openDatabaseAsync`). The project's `package.json` already pins an SDK 50+ version. Mitigation: the adapter's unit tests mock the exact API shape so a version bump that breaks the signature will fail tests immediately.
- **Singleton reset in tests** → The existing `__resetMemoryRepositoryForTests` export must continue to work. Mitigation: the reset function clears the singleton `instance` variable; the new async path uses the same variable, so no change is required.
- **Metro bundling of `@garden/memory`** — The device path in `factory.ts` imports `createBetterSqliteAdapter` at the top of the file. If Metro attempts to resolve `better-sqlite3` it will fail. Mitigation: audit `factory.ts` — if the import is unconditional, a dynamic import guard or a Metro `resolver.blockList` entry is needed (tracked as an open question below and as a task).

## Migration Plan

1. Create adapter file and tests (no runtime change).
2. Update `repository.ts` to use the real adapter behind the existing singleton guard.
3. Run typecheck + lint + test gate locally.
4. Boot emulator, install debug build, capture proof screenshot.
5. No rollback required — the change is self-contained in `apps/mobile/src/core/`; reverting is a one-file change if needed.

## Open Questions

- **Metro bundling of `better-sqlite3` via `factory.ts`**: Does the current Metro config already block-list the Node-only adapter, or will importing `@garden/memory` on device pull in `better-sqlite3`? Must be verified in task 2 and resolved before the PR merges.
