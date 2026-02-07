// Billing Routes - Stripe Integration (one-time checkout flow)

import { Router, type Request, type Response } from "express";
import { authStorage } from "../replit_integrations/auth/storage.js";
import { getStripeClient } from "../utils/stripe.js";

const router = Router();

function getAppBaseUrl(req: Request): string {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  if (isProduction && process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL;
  }
  if (process.env.APP_URL) return process.env.APP_URL;
  
  const origin = req.get("origin");
  return origin || "http://localhost:4000";
}

function getPaymentPriceId(): string | null {
  return (
    process.env.STRIPE_PAYMENT_PRICE_ID ||
    process.env.STRIPE_ONE_TIME_PRICE_ID ||
    process.env.STRIPE_PRO_PRICE_ID ||
    null
  );
}

const FALLBACK_PAYMENT_LINK =
  process.env.STRIPE_PAYMENT_LINK ||
  "https://buy.stripe.com/14AfZj4y1b5he3ggQ47g40c";

/**
 * Creates a Stripe Checkout Session and returns a redirect URL.
 * Requires authentication - userId must be present
 */
router.post("/checkout", async (req: Request, res: Response) => {
  const baseUrl = getAppBaseUrl(req);

  // Get userId from session
  let userId: string | undefined;
  let userEmail: string | undefined;

  // Check session-based auth (magic link)
  if ((req as any).session?.userId) {
    userId = (req as any).session.userId;
    userEmail = (req as any).session.email;
  }
  
  // Fallback: Replit session auth if present
  if (!userId && (req as any).user?.claims?.sub) {
    userId = (req as any).user.claims.sub;
  }
  
  if (!userEmail && userId) {
    const userRecord = await authStorage.getUser(userId);
    userEmail = userRecord?.email ?? undefined;
  }
  
  // Require authentication for checkout
  if (!userId) {
    return res.status(401).json({ error: "Please sign in before starting checkout." });
  }

  const priceId = getPaymentPriceId();

  // If Stripe isn't configured for API-driven checkout, fall back to a pre-made Payment Link.
  if (!priceId) {
    const url = `${FALLBACK_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.json({ url, mode: "payment_link" as const });
  }

  try {
    const stripe = await getStripeClient();

    const session = await stripe.checkout.sessions.create({
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

    return res.json({ url: session.url, mode: "checkout_session" as const });
  } catch (err: any) {
    console.error("[Billing] Checkout error:", err);
    return res.status(500).json({ error: "Failed to start Stripe checkout" });
  }
});

export default router;
