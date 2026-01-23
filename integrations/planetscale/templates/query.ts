// PlanetScale Query Example

import { db } from "./init";

export async function getUsers() {
  const results = await db.execute("SELECT * FROM users");
  return results.rows;
}
