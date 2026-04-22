/** Adapter interface that both better-sqlite3 (Node) and expo-sqlite (device)
 * implement. Async surface so the device adapter can wrap expo-sqlite's
 * Promise API without ceremony. The Node adapter uses Promise.resolve().
 */
export type SqliteLike = {
  exec: (sql: string) => Promise<void>;
  run: (sql: string, params?: ReadonlyArray<unknown>) => Promise<void>;
  all: <T>(sql: string, params?: ReadonlyArray<unknown>) => Promise<T[]>;
  get: <T>(sql: string, params?: ReadonlyArray<unknown>) => Promise<T | undefined>;
  close: () => Promise<void>;
};
