export const migration = {
  id: 3,
  name: "003_events",
  up: `
    CREATE TABLE IF NOT EXISTS inventory_events (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      delta REAL NOT NULL,
      target_record_id TEXT,
      pin_id TEXT,
      sector_id TEXT,
      species_id TEXT,
      pest_species_id TEXT,
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_pin ON inventory_events(pin_id);
    CREATE INDEX IF NOT EXISTS idx_events_sector ON inventory_events(sector_id);
    CREATE INDEX IF NOT EXISTS idx_events_time ON inventory_events(captured_at);
  `
} as const;
