import { SmepErrors } from "@garden/config";
import type { SqliteLike } from "@garden/memory";
import type { SQLiteDatabase } from "expo-sqlite";

export const createExpoSqliteAdapter = (db: SQLiteDatabase): SqliteLike => ({
  exec: async (sql: string) => {
    try {
      await db.execAsync(sql);
    } catch {
      throw SmepErrors.repositoryUnavailable();
    }
  },

  run: async (sql: string, params: ReadonlyArray<unknown> = []) => {
    try {
      await db.runAsync(sql, params as unknown as Parameters<typeof db.runAsync>[1]);
    } catch {
      throw SmepErrors.repositoryUnavailable();
    }
  },

  all: async <T>(sql: string, params: ReadonlyArray<unknown> = []) => {
    try {
      return await db.getAllAsync<T>(
        sql,
        params as unknown as Parameters<typeof db.getAllAsync>[1]
      );
    } catch {
      throw SmepErrors.repositoryUnavailable();
    }
  },

  get: async <T>(sql: string, params: ReadonlyArray<unknown> = []) => {
    try {
      const row = await db.getFirstAsync<T>(
        sql,
        params as unknown as Parameters<typeof db.getFirstAsync>[1]
      );
      return row === null ? undefined : row;
    } catch {
      throw SmepErrors.repositoryUnavailable();
    }
  },

  close: async () => {
    try {
      await db.closeAsync();
    } catch {
      throw SmepErrors.repositoryUnavailable();
    }
  }
});
