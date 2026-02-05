import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../server/db.js";
import { users } from "../shared/models/auth.js";
import { eq } from "drizzle-orm";

function getUserFromCookie(req: VercelRequest): { userId: string; email: string } | null {
  try {
    const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
    const authCookie = cookies.find(c => c.startsWith('auth_session='));
    if (!authCookie) return null;
    
    const sessionToken = authCookie.split('=')[1];
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    // Check expiry
    if (sessionData.exp && Date.now() > sessionData.exp) {
      return null;
    }
    
    return { userId: sessionData.userId, email: sessionData.email };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = getUserFromCookie(req);
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      hasPaid: user.hasPaid === "true",
    });
  } catch (error) {
    console.error("[/api/me] Error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}
