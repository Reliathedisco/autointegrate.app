import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db.js";
import { users, magicTokens } from "../../shared/models/auth.js";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { token, email } = req.query;

    if (!token || typeof token !== "string" || !email || typeof email !== "string") {
      return res.status(400).send("Invalid verification link");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = hashToken(token);

    // Find valid token (unused and not expired)
    const [magicToken] = await db
      .select()
      .from(magicTokens)
      .where(
        and(
          eq(magicTokens.email, normalizedEmail),
          eq(magicTokens.tokenHash, tokenHash),
          gt(magicTokens.expiresAt, new Date())
        )
      );

    if (!magicToken) {
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

    // Mark token as used
    await db
      .update(magicTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicTokens.id, magicToken.id));

    // Get or create user
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        hasPaid: "false",
      }).returning();
    }

    // Set auth cookie (simple JWT)
    const sessionData = JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
    const sessionToken = Buffer.from(sessionData).toString('base64');
    
    res.setHeader('Set-Cookie', `auth_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    // Redirect to app
    const redirectUrl = user.hasPaid ? "/" : "/billing";
    return res.redirect(307, redirectUrl);
  } catch (error: any) {
    console.error("[Magic Auth] Error verifying token:", error);
    return res.status(500).send(`
      <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Verification Failed</h1>
          <p>Something went wrong. Please try again.</p>
          <a href="/" style="color: #0057FF;">Back to Login</a>
        </body>
      </html>
    `);
  }
}
