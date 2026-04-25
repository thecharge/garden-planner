import BetterSqlite from "better-sqlite3";

const makeInMemoryDb = () => {
  const db = new BetterSqlite(":memory:");
  return {
    execAsync: jest.fn(async (sql: string) => {
      db.exec(sql);
    }),
    runAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const info = db.prepare(sql).run(...params);
      return { lastInsertRowId: info.lastInsertRowid as number, changes: info.changes };
    }),
    getAllAsync: jest.fn(async <T>(sql: string, params: unknown[] = []) => {
      return db.prepare(sql).all(...params) as T[];
    }),
    getFirstAsync: jest.fn(async <T>(sql: string, params: unknown[] = []) => {
      const row = db.prepare(sql).get(...params);
      return (row ?? null) as T | null;
    }),
    closeAsync: jest.fn(async () => {
      db.close();
    })
  };
};

export const openDatabaseAsync = jest.fn(async (_name: string) => makeInMemoryDb());
