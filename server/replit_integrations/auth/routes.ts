import type { Express } from "express";
import { authStorage } from "./storage.js";
import { isAuthenticated } from "./replitAuth.js";
import { createClerkClient, verifyToken } from "@clerk/backend";

type AuthContext = { userId: string };

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;

function getPrimaryEmailFromClerkUser(user: any): string | null {
  const primaryId = user?.primaryEmailAddressId;
  const emailObj = user?.emailAddresses?.find((e: any) => e.id === primaryId);
  return emailObj?.emailAddress ?? null;
}

async function getAuthContext(req: any): Promise<AuthContext | null> {
  const authHeader = req.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ") && clerkSecretKey) {
    const token = authHeader.slice("Bearer ".length).trim();
    try {
      const payload: any = await verifyToken(token, { secretKey: clerkSecretKey });
      const userId = payload?.sub;
      if (!userId) return null;

      // Ensure we have a matching user record in our DB
      try {
        const clerkUser = clerkClient ? await clerkClient.users.getUser(userId) : null;
        const email = clerkUser ? getPrimaryEmailFromClerkUser(clerkUser) : null;
        await authStorage.upsertUser({
          id: userId,
          email,
          firstName: clerkUser?.firstName ?? null,
          lastName: clerkUser?.lastName ?? null,
          profileImageUrl: clerkUser?.imageUrl ?? null,
        });
      } catch (e) {
        console.warn("[Auth] Clerk user upsert warning:", (e as any)?.message || e);
      }

      return { userId };
    } catch {
      // Fall through to session auth.
    }
  }

  // Fallback: Replit session auth (existing)
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated() && req.user?.claims?.sub) {
    return { userId: req.user.claims.sub };
  }

  return null;
}

async function requireAuthAny(req: any, res: any, next: any) {
  const ctx = await getAuthContext(req);
  if (!ctx) return res.status(401).json({ message: "Unauthorized" });
  req.auth = ctx;
  return next();
}

export function registerAuthRoutes(app: Express): void {
  app.get("/api/me", requireAuthAny, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await authStorage.getUser(userId);

      if (!user) {
        console.log(`[/api/me] User ${userId} not found in database`);
        return res.status(404).json({ message: "User not found" });
      }

      const hasPaid = user.hasPaid === "true";
      console.log(`[/api/me] User ${userId} (${user.email}) - hasPaid: ${hasPaid}`);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        hasPaid,
      });
    } catch (error) {
      console.error("[/api/me] Error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/me/refresh", requireAuthAny, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await authStorage.getUser(userId);

      if (!user) {
        console.log(`[/api/me/refresh] User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already paid in database
      let hasPaid = user.hasPaid === "true";
      
      // If not paid yet, check Stripe for recent payments by email
      if (!hasPaid && user.email) {
        try {
          const { getStripeClient } = await import("../../utils/stripe.js");
          const stripe = await getStripeClient();
          
          // Search for successful payments with this email
          const charges = await stripe.charges.list({
            limit: 10,
          });
          
          const hasSuccessfulCharge = charges.data.some(
            charge => charge.billing_details.email === user.email && charge.status === "succeeded"
          );
          
          if (hasSuccessfulCharge) {
            // Update user as paid
            await authStorage.upsertUser({
              id: userId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
            });
            
            // Manually set hasPaid
            const { db } = await import("../../db.js");
            const { users } = await import("../../../shared/models/auth.js");
            const { eq } = await import("drizzle-orm");
            
            await db.update(users).set({ hasPaid: "true" }).where(eq(users.id, userId));
            
            hasPaid = true;
            console.log(`[/api/me/refresh] Found payment in Stripe for ${user.email}, updated hasPaid=true`);
          }
        } catch (stripeError) {
          console.warn("[/api/me/refresh] Could not check Stripe:", stripeError);
        }
      }

      console.log(`[/api/me/refresh] User ${userId} (${user.email}) - hasPaid: ${hasPaid}`);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        hasPaid,
      });
    } catch (error) {
      console.error("[/api/me/refresh] Error:", error);
      res.status(500).json({ message: "Failed to refresh user" });
    }
  });

  app.get("/api/auth/user", requireAuthAny, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await authStorage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        hasPaid: user.hasPaid === "true",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/refresh-payment-status", requireAuthAny, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await authStorage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        hasPaid: user.hasPaid === "true",
      });
    } catch (error) {
      console.error("Error refreshing payment status:", error);
      res.status(500).json({ message: "Failed to refresh payment status" });
    }
  });
}
