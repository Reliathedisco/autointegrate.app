// Magic Link Authentication Routes
import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { users, magicTokens } from "../../shared/models/auth.js";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || "http://localhost:4000";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * POST /api/auth/request-link
 * Send a magic link to the user's email
 */
router.post("/request-link", async (req: Request, res: Response) => {
  console.log("[Magic Auth] /request-link called", { body: req.body, hasEmail: !!req.body?.email });
  
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      console.log("[Magic Auth] Invalid email", { email });
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create or get user
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        hasPaid: false,
      }).returning();
    }

    // Generate magic link token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token
    await db.insert(magicTokens).values({
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    });

    // Create magic link
    const magicLink = `${APP_URL}/api/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: normalizedEmail,
        subject: "Sign in to AutoIntegrate",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Sign in to AutoIntegrate</h1>
            <p style="color: #666; font-size: 16px;">Click the button below to sign in to your account:</p>
            <div style="margin: 30px 0;">
              <a href="${magicLink}" style="background: #0057FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Sign In
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">This link expires in 15 minutes.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });
    } else {
      // Development fallback: log the magic link
      console.log("\n🔗 Magic Link (dev mode):", magicLink, "\n");
    }

    console.log("[Magic Auth] Magic link sent successfully", { email: normalizedEmail });
    
    return res.json({ 
      ok: true, 
      message: "Magic link sent! Check your email.",
      ...(process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY ? { devLink: magicLink } : {})
    });
  } catch (error: any) {
    console.error("[Magic Auth] Error sending link:", error);
    console.error("[Magic Auth] Error stack:", error.stack);
    return res.status(500).json({ error: "Failed to send magic link", details: error.message });
  }
});

/**
 * GET /api/auth/verify
 * Verify magic link token and create session
 */
router.get("/verify", async (req: Request, res: Response) => {
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
      return res.status(400).send("Invalid or expired link. Please request a new one.");
    }

    // Check if already used
    if (magicToken.usedAt) {
      return res.status(400).send("This link has already been used. Please request a new one.");
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
        hasPaid: false,
      }).returning();
    }

    // Create session
    if (req.session) {
      (req.session as any).userId = user.id;
      (req.session as any).email = user.email;
    }

    // Redirect to app
    const redirectUrl = user.hasPaid ? "/" : "/billing";
    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("[Magic Auth] Error verifying token:", error);
    return res.status(500).send("Verification failed. Please try again.");
  }
});

/**
 * POST /api/auth/logout
 * Destroy session
 */
router.post("/logout", (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("[Magic Auth] Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      return res.json({ ok: true });
    });
  } else {
    return res.json({ ok: true });
  }
});

export default router;
