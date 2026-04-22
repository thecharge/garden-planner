export const migration = {
  id: 4,
  name: "004_permit_specs",
  up: `
    CREATE TABLE IF NOT EXISTS permit_specs (
      id TEXT PRIMARY KEY,
      scan_id TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      body TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_permits_scan ON permit_specs(scan_id);
  `
} as const;
