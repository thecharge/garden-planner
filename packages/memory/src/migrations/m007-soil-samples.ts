export const migration = {
  id: 7,
  name: "007_soil_samples",
  up: `
    CREATE TABLE IF NOT EXISTS soil_samples (
      id TEXT PRIMARY KEY,
      sector_id TEXT,
      pin_id TEXT,
      captured_at TEXT NOT NULL,
      ph REAL NOT NULL,
      texture TEXT NOT NULL,
      npk_json TEXT,
      micros_json TEXT,
      organic_matter_pct REAL,
      ec REAL
    );
    CREATE INDEX IF NOT EXISTS idx_soil_sector ON soil_samples(sector_id);
    CREATE INDEX IF NOT EXISTS idx_soil_pin ON soil_samples(pin_id);
  `
} as const;
