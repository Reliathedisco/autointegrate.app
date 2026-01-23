// PlanetScale Query Example
import { db } from "./init";

export async function query<T>(sql: string, args?: any[]): Promise<T[]> {
  const result = await db.execute(sql, args);
  return result.rows as T[];
}

export async function execute(sql: string, args?: any[]) {
  return db.execute(sql, args);
}

// Example usage
export async function getUsers() {
  return query("SELECT * FROM users");
}

export async function createUser(email: string, name: string) {
  return execute("INSERT INTO users (email, name) VALUES (?, ?)", [email, name]);
}
