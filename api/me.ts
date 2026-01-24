import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient, verifyToken } from "@clerk/backend";
import { db } from "../server/db.js";
import { users } from "../shared/models/auth.js";
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify Clerk token
    const authHeader = req.headers?.authorization as string | undefined;
    if (!authHeader?.startsWith("Bearer ") || !clerkSecretKey) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    let userId: string;
    
    try {
      const payload: any = await verifyToken(token, { secretKey: clerkSecretKey });
      userId = payload?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ensure user exists in database
    try {
      const clerkUser = clerkClient ? await clerkClient.users.getUser(userId) : null;
      const email = clerkUser ? getPrimaryEmailFromClerkUser(clerkUser) : null;
      
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!existingUser) {
        await db.insert(users).values({
          id: userId,
          email,
          firstName: clerkUser?.firstName ?? null,
          lastName: clerkUser?.lastName ?? null,
          profileImageUrl: clerkUser?.imageUrl ?? null,
          hasPaid: "false",
        });
      }
    } catch (e) {
      console.warn("[Auth] User upsert warning:", (e as any)?.message || e);
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
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
}
