import BetterSqlite from "better-sqlite3";
import { SmepErrors } from "@garden/config";
import type { SqliteLike } from "./sqlite-like";

export type BetterSqliteAdapterInput = {
  /** Path or ":memory:". Defaults to an in-memory database. */
  readonly filename?: string;
};

/** Node-side adapter used in tests. Uses better-sqlite3 (synchronous) under the
 *  hood and wraps every call in Promise.resolve so it presents the same async
 *  surface as the expo-sqlite adapter used on device.
 */
export const createBetterSqliteAdapter = (input: BetterSqliteAdapterInput = {}): SqliteLike => {
  const filename = input.filename ?? ":memory:";
  let db: BetterSqlite.Database;
  try {
    db = new BetterSqlite(filename);
  } catch {
    throw SmepErrors.repositoryUnavailable();
  }

  return {
    exec: async (sql: string) => {
      try {
        db.exec(sql);
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    },
    run: async (sql, params = []) => {
      try {
        db.prepare(sql).run(...(params as unknown[]));
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    },
    all: async <T>(sql: string, params: ReadonlyArray<unknown> = []) => {
      try {
        return db.prepare(sql).all(...(params as unknown[])) as T[];
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    },
    get: async <T>(sql: string, params: ReadonlyArray<unknown> = []) => {
      try {
        const row = db.prepare(sql).get(...(params as unknown[]));
        return row === undefined ? undefined : (row as T);
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    },
    close: async () => {
      try {
        db.close();
      } catch {
        throw SmepErrors.repositoryUnavailable();
      }
    }
  };
};
