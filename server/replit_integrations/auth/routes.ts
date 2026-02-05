import type { Express } from "express";
import { authStorage } from "./storage.js";
import { isAuthenticated } from "./replitAuth.js";

type AuthContext = { userId: string };

async function getAuthContext(req: any): Promise<AuthContext | null> {
  // Check session-based auth first (magic link)
  if (req.session?.userId) {
    return { userId: req.session.userId };
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

async function refreshHasPaidFromStripe(params: {
  userId: string;
  email: string | null;
  currentHasPaid: boolean;
}): Promise<boolean> {
  const { userId, email, currentHasPaid } = params;
  if (currentHasPaid) return true;
  if (!userId) return false;

  try {
    const { getStripeClient } = await import("../../utils/stripe.js");
    const stripe = await getStripeClient();
    const anyStripe = stripe as any;

    // Best-effort: search checkout sessions by client_reference_id (most deterministic).
    // Falls back to listing recent sessions/charges for local dev.
    const queries = [
      `client_reference_id:'${userId.replace(/'/g, "\\'")}' AND payment_status:'paid'`,
      `metadata['userId']:'${userId.replace(/'/g, "\\'")}' AND payment_status:'paid'`,
    ];

    if (anyStripe?.checkout?.sessions?.search) {
      for (const query of queries) {
        try {
          const result = await anyStripe.checkout.sessions.search({
            query,
            limit: 1,
          });
          if (result?.data?.[0]) return true;
        } catch {
          // ignore and try next query/fallback
        }
      }
    }

    // Fallback: list recent sessions and match client_reference_id.
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const matched = sessions.data.find(
        (s) =>
          s.client_reference_id === userId &&
          (s.payment_status === "paid" || s.payment_status === "no_payment_required") &&
          s.status === "complete"
      );
      if (matched) return true;
    } catch {
      // ignore
    }

    // Last fallback: scan recent charges by email (weak, but can unblock local dev).
    if (email) {
      try {
        const charges = await stripe.charges.list({ limit: 100 });
        const hasSuccessfulCharge = charges.data.some(
          (charge) =>
            charge.billing_details.email === email && charge.status === "succeeded"
        );
        if (hasSuccessfulCharge) return true;
      } catch {
        // ignore
      }
    }
  } catch (stripeError) {
    console.warn("[Auth] Stripe refresh failed:", stripeError);
  }

  return false;
}

export function registerAuthRoutes(app: Express): void {
  app.get("/api/me", requireAuthAny, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      
      // Try to get user from database
      let user = null;
      let hasPaid = false;
      
      try {
        user = await authStorage.getUser(userId);
        hasPaid = user?.hasPaid === "true";
      } catch (dbError) {
        console.warn("[/api/me] Database unavailable");
        return res.status(500).json({ message: "Database unavailable" });
      }

      if (!user) {
        console.log(`[/api/me] User ${userId} not found in database`);
        return res.status(404).json({ message: "User not found" });
      }

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

      // Check if user already paid in database; if not, try to verify with Stripe.
      let hasPaid = user.hasPaid === "true";
      const refreshedHasPaid = await refreshHasPaidFromStripe({
        userId,
        email: user.email ?? null,
        currentHasPaid: hasPaid,
      });

      if (!hasPaid && refreshedHasPaid) {
        const { db } = await import("../../db.js");
        const { users } = await import("../../../shared/models/auth.js");
        const { eq } = await import("drizzle-orm");
        await db
          .update(users)
          .set({ hasPaid: true, updatedAt: new Date() })
          .where(eq(users.id, userId));
        hasPaid = true;
        console.log(
          `[/api/me/refresh] Verified Stripe payment for user ${userId} (${user.email}), updated hasPaid=true`
        );
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

      // Keep this endpoint backwards compatible, but make it actually refresh.
      let hasPaid = user.hasPaid === "true";
      const refreshedHasPaid = await refreshHasPaidFromStripe({
        userId,
        email: user.email ?? null,
        currentHasPaid: hasPaid,
      });

      if (!hasPaid && refreshedHasPaid) {
        const { db } = await import("../../db.js");
        const { users } = await import("../../../shared/models/auth.js");
        const { eq } = await import("drizzle-orm");
        await db
          .update(users)
          .set({ hasPaid: true, updatedAt: new Date() })
          .where(eq(users.id, userId));
        hasPaid = true;
      }

      res.json({
        hasPaid,
      });
    } catch (error) {
      console.error("Error refreshing payment status:", error);
      res.status(500).json({ message: "Failed to refresh payment status" });
    }
  });
}
