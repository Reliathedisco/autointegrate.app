// Billing Routes - Stripe Integration (one-time checkout flow)

import { Router, type Request, type Response } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { authStorage } from "../replit_integrations/auth/storage.js";
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

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;

function getPrimaryEmailFromClerkUser(user: any): string | null {
  const primaryId = user?.primaryEmailAddressId;
  const emailObj = user?.emailAddresses?.find((e: any) => e.id === primaryId);
  return emailObj?.emailAddress ?? null;
}

/**
 * Creates a Stripe Checkout Session and returns a redirect URL.
 *
 * - Authenticated: attaches `client_reference_id` and `customer_email`
 * - Unauthenticated: allows checkout; webhook will fall back to customer email if it matches a later login
 */
router.post("/checkout", async (req: Request, res: Response) => {
  const baseUrl = getAppBaseUrl(req);
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";

  let userId: string | undefined;
  let userEmail: string | undefined;

  // Prefer Clerk Bearer token if present (Clerk-first auth)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ") && clerkSecretKey) {
    const token = authHeader.slice("Bearer ".length).trim();
    try {
      const payload: any = await verifyToken(token, { secretKey: clerkSecretKey });
      userId = payload?.sub || undefined;
      if (userId && clerkClient) {
        const clerkUser = await clerkClient.users.getUser(userId);
        userEmail = getPrimaryEmailFromClerkUser(clerkUser) || undefined;
        await authStorage.upsertUser({
          id: userId,
          email: userEmail ?? null,
          firstName: clerkUser.firstName ?? null,
          lastName: clerkUser.lastName ?? null,
          profileImageUrl: clerkUser.imageUrl ?? null,
        });
      }
    } catch {
      // ignore, allow anonymous checkout
    }
  }

  // Fallback: Replit session auth if present
  if (!userId) {
    userId = (req as any).user?.claims?.sub as string | undefined;
  }
  if (!userEmail && userId) {
    const userRecord = await authStorage.getUser(userId);
    userEmail = userRecord?.email ?? undefined;
  }

  const priceId = getPaymentPriceId();

  // If Stripe isn't configured for API-driven checkout, fall back to a pre-made Payment Link.
  if (!priceId) {
    if (isProduction) {
      return res.status(503).json({
        error:
          "Billing not configured. Set STRIPE_PAYMENT_PRICE_ID (or STRIPE_ONE_TIME_PRICE_ID).",
      });
    }
    const url = userId
      ? `${FALLBACK_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(userId)}`
      : FALLBACK_PAYMENT_LINK;
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
        userId: userId || "anonymous",
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
    const url = userId
      ? `${FALLBACK_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(userId)}`
      : FALLBACK_PAYMENT_LINK;
    return res.status(200).json({ url, mode: "payment_link" as const });
  }
});

export default router;
