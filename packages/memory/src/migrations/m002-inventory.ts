export const migration = {
  id: 2,
  name: "002_inventory",
  up: `
    CREATE TABLE IF NOT EXISTS inventory_records (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      acquired_at TEXT NOT NULL,
      source_supplier_id TEXT,
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_inventory_kind ON inventory_records(kind);
  `
} as const;
