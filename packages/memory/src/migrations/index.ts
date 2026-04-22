import { SmepErrors } from "@garden/config";
import type { SqliteLike } from "../adapters/sqlite-like";
import { migration as m001 } from "./m001-scans";
import { migration as m002 } from "./m002-inventory";
import { migration as m003 } from "./m003-events";
import { migration as m004 } from "./m004-permit-specs";
import { migration as m005 } from "./m005-sectors";
import { migration as m006 } from "./m006-harvests";
import { migration as m007 } from "./m007-soil-samples";

export type Migration = {
  readonly id: number;
  readonly name: string;
  readonly up: string;
};

export const migrations: ReadonlyArray<Migration> = [m001, m002, m003, m004, m005, m006, m007];

const SCHEMA_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

/** Idempotent migration runner. Safe to re-run; re-applies nothing that is already recorded. */
export const runMigrations = async (sqlite: SqliteLike): Promise<ReadonlyArray<number>> => {
  try {
    await sqlite.exec(SCHEMA_TABLE_SQL);
  } catch {
    throw SmepErrors.repositoryUnavailable();
  }
  const appliedRows = await sqlite.all<{ id: number }>(
    "SELECT id FROM schema_migrations ORDER BY id ASC"
  );
  const appliedIds = new Set(appliedRows.map((r) => r.id));
  const applied: number[] = [];
  for (const m of migrations) {
    if (appliedIds.has(m.id)) {
      continue;
    }
    await sqlite.exec(m.up);
    await sqlite.run("INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)", [
      m.id,
      m.name,
      new Date().toISOString()
    ]);
    applied.push(m.id);
  }
  return applied;
};
