import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db.js";
import { users, magicTokens } from "../../shared/models/auth.js";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"; // TODO: Use a strong, random secret in production

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  console.log("[Magic Auth Verify] Starting verification...");
  
  try {
    const { token, email } = req.query;

    if (!token || typeof token !== "string" || !email || typeof email !== "string") {
      console.log("[Magic Auth Verify] Invalid parameters");
      return res.status(400).send("Invalid verification link");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = hashToken(token);

    console.log(`[Magic Auth Verify] Looking up token for ${normalizedEmail}`);
    
    // Find valid token (unused and not expired) with timeout
    const [magicToken] = await Promise.race([
      db.select().from(magicTokens).where(
        and(
          eq(magicTokens.email, normalizedEmail),
          eq(magicTokens.tokenHash, tokenHash),
          gt(magicTokens.expiresAt, new Date())
        )
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 8000)
      )
    ]) as any;

    console.log(`[Magic Auth Verify] Token lookup completed in ${Date.now() - startTime}ms`);

    if (!magicToken) {
      console.log("[Magic Auth Verify] No valid token found");
      return res.status(400).send(`
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Invalid or Expired Link</h1>
            <p>This magic link is invalid or has expired. Please request a new one.</p>
            <a href="/" style="color: #0057FF;">Back to Login</a>
          </body>
        </html>
      `);
    }

    // Check if already used
    if (magicToken.usedAt) {
      console.log("[Magic Auth Verify] Token already used");
      return res.status(400).send(`
        <html>
          <head><title>Link Already Used</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Link Already Used</h1>
            <p>This magic link has already been used. Please request a new one.</p>
            <a href="/" style="color: #0057FF;">Back to Login</a>
          </body>
        </html>
      `);
    }

    console.log("[Magic Auth Verify] Marking token as used");
    // Mark token as used
    await db
      .update(magicTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicTokens.id, magicToken.id));

    console.log("[Magic Auth Verify] Fetching user");
    // Get or create user
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        hasPaid: false,
      }).returning();
    }

    console.log("[Magic Auth Verify] Creating session token");
    // Set auth cookie (simple JWT)
    const sessionToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    
    res.setHeader('Set-Cookie', `auth_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    // Redirect to app (hasPaid is boolean in schema)
    const redirectUrl = user.hasPaid === true ? "/" : "/billing";
    console.log(`[Magic Auth Verify] Success! Redirecting to ${redirectUrl}. Total time: ${Date.now() - startTime}ms`);
    return res.redirect(307, redirectUrl);
  } catch (error: any) {
    console.error("[Magic Auth Verify] Error:", error.message);
    console.error("[Magic Auth Verify] Stack:", error.stack);
    console.error(`[Magic Auth Verify] Failed after ${Date.now() - startTime}ms`);
    
    return res.status(500).send(`
      <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Verification Failed</h1>
          <p>Something went wrong. Please try again.</p>
          <p style="color: #999; font-size: 12px;">Error: ${error.message}</p>
          <a href="/" style="color: #0057FF;">Back to Login</a>
        </body>
      </html>
    `);
  }
}
