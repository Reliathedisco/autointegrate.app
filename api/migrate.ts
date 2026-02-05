import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from "pg";

const { Pool } = pg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        has_paid VARCHAR DEFAULT 'false' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire)`);
    
    // Create magic_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS magic_tokens (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR NOT NULL,
        token_hash VARCHAR NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS IDX_magic_tokens_email ON magic_tokens(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS IDX_magic_tokens_expires ON magic_tokens(expires_at)`);
    
    // Create payment_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_events (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR,
        stripe_session_id VARCHAR,
        stripe_customer_id VARCHAR,
        amount VARCHAR,
        status VARCHAR NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    return res.json({ ok: true, message: "All tables created" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
    await pool.end();
  }
}
