import type { VercelRequest, VercelResponse } from "@vercel/node";

const guestUser = {
  id: "guest",
  email: null,
  firstName: "Guest",
  lastName: null,
  profileImageUrl: null,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.json({
      user: guestUser,
      hasPaid: true,
    });
  } catch (error) {
    console.error("[/api/me] Error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}
