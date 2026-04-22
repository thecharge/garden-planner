import { SmepErrors } from "@garden/config";
import { createBetterSqliteAdapter } from "./adapters/better-sqlite";
import type { SqliteLike } from "./adapters/sqlite-like";
import { buildRepository } from "./repository-impl";
import type { MemoryRepository } from "./memory-repository";

export type CreateMemoryRepositoryInput =
  | { readonly mode: "in-memory" }
  | { readonly mode: "file"; readonly filename: string }
  | { readonly mode: "device"; readonly sqlite: SqliteLike };

/** The single entry point. Device mode accepts an adapter built by the mobile
 * app from its own expo-sqlite database handle — this keeps @garden/memory
 * Expo-free while still serving the device at runtime.
 */
export const createMemoryRepository = async (
  input: CreateMemoryRepositoryInput
): Promise<MemoryRepository> => {
  if (input.mode === "in-memory") {
    return buildRepository(createBetterSqliteAdapter());
  }
  if (input.mode === "file") {
    return buildRepository(createBetterSqliteAdapter({ filename: input.filename }));
  }
  if (input.mode === "device") {
    if (!input.sqlite) {
      throw SmepErrors.repositoryUnavailable();
    }
    return buildRepository(input.sqlite);
  }
  throw SmepErrors.repositoryUnavailable();
};
