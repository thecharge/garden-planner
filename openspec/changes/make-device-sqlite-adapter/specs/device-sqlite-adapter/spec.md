## ADDED Requirements

### Requirement: expo-sqlite adapter implements SqliteLike

The system SHALL provide `createExpoSqliteAdapter(db: SQLiteDatabase): SqliteLike` in `apps/mobile/src/core/storage/expo-sqlite-adapter.ts` that wraps an `expo-sqlite` `SQLiteDatabase` handle and satisfies the `SqliteLike` interface from `@garden/memory`.

#### Scenario: exec forwards DDL to expo-sqlite

- **WHEN** `adapter.exec(sql)` is called with a valid DDL statement
- **THEN** `db.execAsync(sql)` MUST be awaited and any error re-thrown as `SmepErrors.repositoryUnavailable()`

#### Scenario: run forwards parameterised DML

- **WHEN** `adapter.run(sql, params)` is called
- **THEN** `db.runAsync(sql, params)` MUST be awaited and any error re-thrown as `SmepErrors.repositoryUnavailable()`

#### Scenario: all returns typed row array

- **WHEN** `adapter.all<T>(sql, params)` is called
- **THEN** the return value MUST be `db.getAllAsync<T>(sql, params)` cast to `T[]`
- **AND** any error MUST be re-thrown as `SmepErrors.repositoryUnavailable()`

#### Scenario: get returns first row or undefined

- **WHEN** `adapter.get<T>(sql, params)` is called and the query returns a row
- **THEN** the value MUST equal `db.getFirstAsync<T>(sql, params)`

#### Scenario: get returns undefined on empty result

- **WHEN** `adapter.get<T>(sql, params)` is called and the query returns no rows
- **THEN** the return value MUST be `undefined` (not `null`)

#### Scenario: close delegates to expo-sqlite close

- **WHEN** `adapter.close()` is called
- **THEN** `db.closeAsync()` MUST be awaited and any error re-thrown as `SmepErrors.repositoryUnavailable()`

#### Scenario: expo-sqlite error is normalised

- **WHEN** any underlying `expo-sqlite` method rejects with a native error
- **THEN** the adapter MUST throw `SmepErrors.repositoryUnavailable()` — never the raw native error

### Requirement: Mobile app bootstraps with the SQLite-backed repository

The mobile app SHALL open `garden.db` via `expo-sqlite` on first `getMemoryRepository()` call and wire the resulting handle through `createExpoSqliteAdapter` into `createMemoryRepository({ mode: 'device', sqlite })`. Schema migrations MUST complete before the returned `Promise<MemoryRepository>` resolves.

#### Scenario: First call opens DB and runs migrations

- **WHEN** `getMemoryRepository()` is called for the first time on a fresh install
- **THEN** `openDatabaseAsync('garden.db')` MUST be called exactly once
- **AND** all schema migrations MUST have applied before the promise resolves
- **AND** the resolved value MUST satisfy the full `MemoryRepository` interface

#### Scenario: Subsequent calls return the same instance

- **WHEN** `getMemoryRepository()` is called a second time in the same process
- **THEN** `openDatabaseAsync` MUST NOT be called again
- **AND** the identical `MemoryRepository` instance MUST be returned

#### Scenario: DB open failure surfaces as typed error

- **WHEN** `openDatabaseAsync` rejects (e.g. storage permission denied)
- **THEN** `getMemoryRepository()` MUST reject with `SmepErrors.repositoryUnavailable()`
