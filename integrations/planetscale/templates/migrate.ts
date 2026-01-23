// PlanetScale Schema Migration Template

import { db } from "./init";

export async function runMigration() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id VARCHAR(36) PRIMARY KEY,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
