import type { Express } from "express";

const guestUser = {
  id: "guest",
  email: null,
  firstName: "Guest",
  lastName: null,
  profileImageUrl: null,
};

export function registerAuthRoutes(app: Express): void {
  app.get("/api/me", (_req, res) => {
    res.json({
      user: guestUser,
      hasPaid: true,
    });
  });

  app.post("/api/me/refresh", (_req, res) => {
    res.json({
      user: guestUser,
      hasPaid: true,
    });
  });

  app.get("/api/auth/user", (_req, res) => {
    res.json({
      ...guestUser,
      hasPaid: true,
    });
  });

  app.post("/api/auth/refresh-payment-status", (_req, res) => {
    res.json({ hasPaid: true });
  });
}
