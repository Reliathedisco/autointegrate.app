// Billing Routes - Stripe Integration (one-time checkout flow)

import { Router, type Request, type Response } from "express";
import { getStripeClient } from "../utils/stripe.js";

const router = Router();

// Canonical production domain (kept for backwards compatibility with Replit auth redirects)
const CANONICAL_DOMAIN = "autointegrate--reli2.replit.app";

function getAppBaseUrl(req: Request): string {
  // Prefer explicit env to avoid host/proxy ambiguity.
  if (process.env.APP_URL) return process.env.APP_URL;

  // In production on Replit, this should match the canonical domain.
  if (process.env.REPLIT_DEPLOYMENT === "1") {
    return `https://${CANONICAL_DOMAIN}`;
  }

  // Local dev fallback (Vite default per README)
  const origin = req.get("origin");
  return origin || "http://localhost:5000";
}

function getPaymentPriceId(): string | null {
  return (
    process.env.STRIPE_PAYMENT_PRICE_ID ||
    process.env.STRIPE_ONE_TIME_PRICE_ID ||
    null
  );
}

const FALLBACK_PAYMENT_LINK =
  process.env.STRIPE_PAYMENT_LINK ||
  "https://buy.stripe.com/7sYaEZ1lP5KX9N0gQ47g401";

/**
 * Creates a Stripe Checkout Session and returns a redirect URL.
 *
 * - Anonymous checkout: no login required.
 */
router.post("/checkout", async (req: Request, res: Response) => {
  const baseUrl = getAppBaseUrl(req);
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const userId = "guest";
  const userEmail = typeof (body as any).email === "string" ? (body as any).email : undefined;

  const priceId = getPaymentPriceId();

  // If Stripe isn't configured for API-driven checkout, fall back to a pre-made Payment Link.
  if (!priceId) {
    if (isProduction) {
      return res.status(503).json({
        error:
          "Billing not configured. Set STRIPE_PAYMENT_PRICE_ID (or STRIPE_ONE_TIME_PRICE_ID).",
      });
    }
    const url = `${FALLBACK_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.json({ url, mode: "payment_link" as const });
  }

  try {
    const stripe = await getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Always send users to an explicit success page with a button back to the app.
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/billing?canceled=true`,
      client_reference_id: userId,
      customer_email: userEmail,
      customer_creation: "always",
      metadata: {
        source: "autointegrate",
        userId,
      },
      // Add custom text to help users navigate back
      custom_text: {
        submit: {
          message: "After payment, you'll be redirected back to AutoIntegrate to continue."
        }
      }
    });

    return res.json({ url: session.url, mode: "checkout_session" as const });
  } catch (err: any) {
    console.error("[Billing] Checkout error:", err);
    if (isProduction) {
      return res.status(500).json({ error: "Failed to start Stripe checkout" });
    }
    // Local dev fallback to payment link, so devs aren't blocked.
    const url = `${FALLBACK_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.status(200).json({ url, mode: "payment_link" as const });
  }
});

export default router;
