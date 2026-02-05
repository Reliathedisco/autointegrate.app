import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripeClient } from "../../server/utils/stripe.js";
import { db } from "../../server/db.js";
import { users } from "../../shared/models/auth.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

function getUserFromCookie(req: VercelRequest): { userId: string; email: string } | null {
  try {
    const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
    const authCookie = cookies.find(c => c.startsWith('auth_session='));
    if (!authCookie) return null;
    
    const sessionToken = authCookie.split('=')[1];
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string; email: string; exp: number };
    
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

function getAppBaseUrl(req: VercelRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  const host = req.headers.host || 'localhost:4000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getUserFromCookie(req);
  if (!session) {
    return res.status(401).json({ error: "Please sign in first" });
  }

  const { userId, email: userEmail } = session;
  const baseUrl = getAppBaseUrl(req);
  
  const priceId = process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PAYMENT_PRICE_ID;
  const fallbackLink = process.env.STRIPE_PAYMENT_LINK || "https://buy.stripe.com/14AfZj4y1b5he3ggQ47g40c";

  if (!priceId) {
    const url = `${fallbackLink}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.json({ url, mode: "payment_link" as const });
  }

  try {
    const stripe = await getStripeClient();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/billing?canceled=true`,
      client_reference_id: userId,
      customer_email: userEmail,
      customer_creation: "always",
      metadata: {
        source: "autointegrate",
        userId,
      },
      custom_text: {
        submit: {
          message: "After payment, you'll be redirected back to AutoIntegrate to continue."
        }
      }
    });

    return res.json({ url: checkoutSession.url, mode: "checkout_session" as const });
  } catch (err: any) {
    console.error("[Billing] Checkout error:", err);
    return res.status(500).json({ error: "Failed to start Stripe checkout" });
  }
}
