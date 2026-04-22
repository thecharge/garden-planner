export const migration = {
  id: 5,
  name: "005_sectors",
  up: `
    CREATE TABLE IF NOT EXISTS sectors (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      name TEXT NOT NULL,
      polygon_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sectors_plot ON sectors(plot_id);
  `
} as const;
