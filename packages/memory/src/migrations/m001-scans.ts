export const migration = {
  id: 1,
  name: "001_scans",
  up: `
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      confidence REAL NOT NULL,
      data_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS'
    );
    CREATE INDEX IF NOT EXISTS idx_scans_captured_at ON scans(captured_at);
  `
} as const;
