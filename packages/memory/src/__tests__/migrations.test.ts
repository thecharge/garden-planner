import { createBetterSqliteAdapter } from "../adapters/better-sqlite";
import { migrations, runMigrations } from "../migrations";

describe("runMigrations", () => {
  it("applies all migrations on a fresh DB in ascending order", async () => {
    const db = createBetterSqliteAdapter();
    const applied = await runMigrations(db);
    expect(applied).toEqual(migrations.map((m) => m.id));
    const rows = await db.all<{ id: number }>("SELECT id FROM schema_migrations ORDER BY id ASC");
    expect(rows.map((r) => r.id)).toEqual(migrations.map((m) => m.id));
    await db.close();
  });

  it("re-run is a no-op (idempotent)", async () => {
    const db = createBetterSqliteAdapter();
    await runMigrations(db);
    const secondRun = await runMigrations(db);
    expect(secondRun).toEqual([]);
    await db.close();
  });

  it("resumes after a partial prior state", async () => {
    const db = createBetterSqliteAdapter();
    await db.exec(
      `CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT, applied_at TEXT)`
    );
    await db.run("INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)", [
      1,
      "001_scans",
      "2026-04-01T00:00:00.000Z"
    ]);
    // Must still create the scans table so later migrations work; simulate partial.
    await db.exec(migrations[0]!.up);
    const applied = await runMigrations(db);
    // 1 was already there; expect 2..7 newly applied.
    expect(applied).toEqual(migrations.slice(1).map((m) => m.id));
    await db.close();
  });
});
