import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient, verifyToken } from "@clerk/backend";
import { getStripeClient } from "../../server/utils/stripe.js";
import { db } from "../../server/db.js";
import { users } from "../../shared/models/auth.js";
import { eq } from "drizzle-orm";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;

function getPrimaryEmailFromClerkUser(user: any): string | null {
  const primaryId = user?.primaryEmailAddressId;
  const emailObj = user?.emailAddresses?.find((e: any) => e.id === primaryId);
  return emailObj?.emailAddress ?? null;
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

  const baseUrl = getAppBaseUrl(req);
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  let userId: string | undefined;
  let userEmail: string | undefined;

  // Try to get user from Clerk token
  const authHeader = req.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ") && clerkSecretKey) {
    const token = authHeader.slice("Bearer ".length).trim();
    try {
      const payload: any = await verifyToken(token, { secretKey: clerkSecretKey });
      userId = payload?.sub || undefined;
      if (userId && clerkClient) {
        const clerkUser = await clerkClient.users.getUser(userId);
        userEmail = getPrimaryEmailFromClerkUser(clerkUser) || undefined;
        
        // Upsert user
        const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!existingUser) {
          await db.insert(users).values({
            id: userId,
            email: userEmail ?? null,
            firstName: clerkUser.firstName ?? null,
            lastName: clerkUser.lastName ?? null,
            profileImageUrl: clerkUser.imageUrl ?? null,
            hasPaid: "false",
          });
        }
      }
    } catch {
      // Allow anonymous checkout
    }
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PAYMENT_PRICE_ID;
  
  // Fallback to payment link if no price ID
  if (!priceId) {
    const fallbackLink = process.env.STRIPE_PAYMENT_LINK || "https://buy.stripe.com/7sYaEZ1lP5KX9N0gQ47g401";
    const url = userId
      ? `${fallbackLink}?client_reference_id=${encodeURIComponent(userId)}`
      : fallbackLink;
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
        userId: userId || "anonymous",
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
    const url = userId
      ? `${fallbackLink}?client_reference_id=${encodeURIComponent(userId)}`
      : fallbackLink;
    return res.status(200).json({ url, mode: "payment_link" as const });
  }
}
