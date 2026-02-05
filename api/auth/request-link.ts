import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db.js";
import { users, magicTokens } from "../../shared/models/auth.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";

const APP_URL = process.env.APP_URL || "http://localhost:4000";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body as { email?: string };

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create or get user
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        hasPaid: "false",
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
    const magicLink = `${APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email via Resend
    if (resend) {
      try {
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
        console.log("[Magic Auth] Email sent to", normalizedEmail);
      } catch (emailError: any) {
        console.error("[Magic Auth] Resend error:", emailError);
        // Continue anyway and return the dev link
      }
    } else {
      console.log("\n🔗 Magic Link (dev/no Resend):", magicLink, "\n");
    }

    return res.json({ 
      ok: true, 
      message: resend ? "Magic link sent! Check your email." : "Magic link created",
      ...(!resend ? { devLink: magicLink } : {})
    });
  } catch (error: any) {
    console.error("[Magic Auth] Error:", error);
    return res.status(500).json({ error: "Failed to send magic link", details: error.message });
  }
}
