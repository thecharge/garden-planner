import { createMemoryRepository } from "@garden/memory";
import type { MemoryRepository } from "@garden/memory";
import { openDatabaseAsync } from "expo-sqlite";
import { createExpoSqliteAdapter } from "../storage";

let instance: Promise<MemoryRepository> | null = null;

export const getMemoryRepository = (): Promise<MemoryRepository> => {
  if (instance) {
    return instance;
  }
  instance = openDatabaseAsync("garden.db").then((db) =>
    createMemoryRepository({ mode: "device", sqlite: createExpoSqliteAdapter(db) })
  );
  return instance;
};

export const __resetMemoryRepositoryForTests = (): void => {
  instance = null;
};
