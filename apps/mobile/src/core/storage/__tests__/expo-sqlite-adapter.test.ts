import { SmepErrors } from "@garden/config";
import { createExpoSqliteAdapter } from "../expo-sqlite-adapter";

const makeDb = (overrides: Partial<MockDb> = {}): MockDb => ({
  execAsync: jest.fn(async () => undefined),
  runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
  getAllAsync: jest.fn(async () => []),
  getFirstAsync: jest.fn(async () => null),
  closeAsync: jest.fn(async () => undefined),
  ...overrides
});

type MockDb = {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  closeAsync: jest.Mock;
};

const expectedError = SmepErrors.repositoryUnavailable();

describe("createExpoSqliteAdapter", () => {
  it.each([
    {
      label: "Happy — exec succeeds",
      setup: () => makeDb(),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) =>
        adapter.exec("CREATE TABLE t (id TEXT)"),
      expect: (result: unknown) => expect(result).toBeUndefined()
    },
    {
      label: "Happy — run succeeds",
      setup: () => makeDb(),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) =>
        adapter.run("INSERT INTO t VALUES (?)", ["x"]),
      expect: (result: unknown) => expect(result).toBeUndefined()
    },
    {
      label: "Happy — all returns rows",
      setup: () => makeDb({ getAllAsync: jest.fn(async () => [{ id: "1" }]) }),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) => adapter.all("SELECT * FROM t"),
      expect: (result: unknown) => expect(result).toEqual([{ id: "1" }])
    },
    {
      label: "Happy — get returns first row",
      setup: () => makeDb({ getFirstAsync: jest.fn(async () => ({ id: "1" })) }),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) =>
        adapter.get("SELECT * FROM t WHERE id = ?", ["1"]),
      expect: (result: unknown) => expect(result).toEqual({ id: "1" })
    },
    {
      label: "Happy — close succeeds",
      setup: () => makeDb(),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) => adapter.close(),
      expect: (result: unknown) => expect(result).toBeUndefined()
    },
    {
      label: "Side — get returns undefined when getFirstAsync returns null",
      setup: () => makeDb({ getFirstAsync: jest.fn(async () => null) }),
      act: (adapter: ReturnType<typeof createExpoSqliteAdapter>) =>
        adapter.get("SELECT * FROM t WHERE id = ?", ["missing"]),
      expect: (result: unknown) => expect(result).toBeUndefined()
    }
  ])("$label", async ({ setup, act, expect: check }) => {
    const db = setup();
    const adapter = createExpoSqliteAdapter(
      db as unknown as Parameters<typeof createExpoSqliteAdapter>[0]
    );
    const result = await act(adapter);
    check(result);
  });

  it.each([
    { label: "Chaos — exec rejects", method: "exec" as const, args: ["BAD SQL"] as const },
    { label: "Chaos — run rejects", method: "run" as const, args: ["BAD SQL"] as const },
    { label: "Chaos — all rejects", method: "all" as const, args: ["BAD SQL"] as const },
    { label: "Chaos — get rejects", method: "get" as const, args: ["BAD SQL"] as const },
    { label: "Chaos — close rejects", method: "close" as const, args: [] as const }
  ])("$label → throws SmepError", async ({ method, args }) => {
    const platformError = { message: "SQLITE_ERROR: near 'BAD': syntax error" };
    const rejectDb = makeDb({
      execAsync: jest.fn(async () => {
        throw platformError;
      }),
      runAsync: jest.fn(async () => {
        throw platformError;
      }),
      getAllAsync: jest.fn(async () => {
        throw platformError;
      }),
      getFirstAsync: jest.fn(async () => {
        throw platformError;
      }),
      closeAsync: jest.fn(async () => {
        throw platformError;
      })
    });
    const adapter = createExpoSqliteAdapter(
      rejectDb as unknown as Parameters<typeof createExpoSqliteAdapter>[0]
    );
    await expect(
      (adapter[method] as (...a: unknown[]) => Promise<unknown>)(...args)
    ).rejects.toMatchObject({ code: expectedError.code, message: expectedError.message });
  });
});
