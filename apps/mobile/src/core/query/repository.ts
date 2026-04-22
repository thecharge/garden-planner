import { createMemoryRepository } from "@garden/memory";
import type { MemoryRepository } from "@garden/memory";

/** Lazily constructed singleton MemoryRepository used by every feature hook's
 * `queryFn`. In MVP this is an in-memory adapter backed by better-sqlite3
 * when running in Node tests; on device, the app swaps in an expo-sqlite-backed
 * SqliteLike adapter (`createMemoryRepository({ mode: "device", sqlite })`).
 */
let instance: MemoryRepository | null = null;

export const getMemoryRepository = async (): Promise<MemoryRepository> => {
  if (instance) {
    return instance;
  }
  instance = await createMemoryRepository({ mode: "in-memory" });
  return instance;
};

/** Reset for tests. */
export const __resetMemoryRepositoryForTests = (): void => {
  instance = null;
};
