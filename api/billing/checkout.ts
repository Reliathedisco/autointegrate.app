import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripeClient } from "../../server/utils/stripe.js";

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

  const baseUrl = getAppBaseUrl(req);
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  const userId = "guest";
  const body = typeof req.body === "object" && req.body ? req.body : {};
  const userEmail = typeof (body as any).email === "string" ? (body as any).email : undefined;

  const priceId = process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PAYMENT_PRICE_ID;
  
  // Fallback to payment link if no price ID
  if (!priceId) {
    const fallbackLink = process.env.STRIPE_PAYMENT_LINK || "https://buy.stripe.com/7sYaEZ1lP5KX9N0gQ47g401";
    const url = `${fallbackLink}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.json({ url, mode: "payment_link" as const });
  }

  try {
    const stripe = await getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
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
    if (isProduction) {
      return res.status(500).json({ error: "Failed to start Stripe checkout" });
    }
    
    // Local dev fallback
    const fallbackLink = process.env.STRIPE_PAYMENT_LINK || "https://buy.stripe.com/7sYaEZ1lP5KX9N0gQ47g401";
    const url = `${fallbackLink}?client_reference_id=${encodeURIComponent(userId)}`;
    return res.status(200).json({ url, mode: "payment_link" as const });
  }
}
