import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from "pg";

const { Pool } = pg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    
    return res.json({ tables: result.rows });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
    await pool.end();
  }
}
