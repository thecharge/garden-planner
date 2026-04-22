export const migration = {
  id: 6,
  name: "006_harvests",
  up: `
    CREATE TABLE IF NOT EXISTS harvests (
      id TEXT PRIMARY KEY,
      sector_id TEXT NOT NULL,
      species_id TEXT NOT NULL,
      weight_grams REAL NOT NULL,
      harvested_at TEXT NOT NULL,
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_harvests_sector ON harvests(sector_id);
    CREATE INDEX IF NOT EXISTS idx_harvests_time ON harvests(harvested_at);
  `
} as const;
