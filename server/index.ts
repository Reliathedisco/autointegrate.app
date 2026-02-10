import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import { PORT } from "./config.js";
import apiRoutes from "./routes/api.js";
import jobRoutes from "./routes/jobs.js";
import templateRoutes from "./routes/templates.js";
import githubRoutes from "./routes/github.js";
import aiRoutes from "./routes/ai.js";
import sandboxRoutes from "./routes/sandbox.js";
import integrationsRoutes from "./routes/integrations.js";
import billingRoutes from "./routes/billing.js";
import demoRoutes from "./routes/demo.js";
import metricsRoutes from "./routes/metrics.js";
import stripeWebhookRoutes from "./routes/stripe-webhook.js";
import githubAuthRoutes from "./routes/github-auth.js";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth/index.js";
import passport from "passport";

import { log } from "./utils/logger.js";

// Start worker (disabled for Vercel serverless - workers don't work in serverless)
// import "./worker/index.js";

const app = express();

app.use(cors());

// Stripe webhook must be registered BEFORE bodyParser.json()
app.use("/api/stripe/webhook", stripeWebhookRoutes);

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session-based auth (for magic links and Replit fallback)
const hasSessionConfig = Boolean(process.env.SESSION_SECRET) && Boolean(process.env.DATABASE_URL);

if (hasSessionConfig) {
  const canUseReplitAuth = Boolean(process.env.REPL_ID);
  
  if (canUseReplitAuth) {
    await setupAuth(app);
    registerAuthRoutes(app);
  } else {
    // Session auth for GitHub OAuth
    const session = await import("express-session");
    const ConnectPgSimple = (await import("connect-pg-simple")).default;
    const PgStore = ConnectPgSimple(session.default);
    const { pool } = await import("./db.js");
    
    app.use(
      session.default({
        store: new PgStore({ pool, tableName: "sessions" }),
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        },
      })
    );
    
    // Initialize Passport for GitHub OAuth
    app.use(passport.initialize());
    app.use(passport.session());

    // Register /api/me and other auth routes for GitHub OAuth sessions
    registerAuthRoutes(app);

    log.info("[Auth] Using GitHub OAuth session auth");
  }
} else {
  log.warn("[Auth] No session config. Auth will not work.");
}

// --- ROUTES ---
app.use("/api/auth", githubAuthRoutes);
app.use("/api", apiRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sandbox", sandboxRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/metrics", metricsRoutes);

// serve sandbox static UI
app.use(
  "/sandbox",
  express.static(path.join(process.cwd(), "sandbox"))
);

// In production, serve the built frontend (only for non-Vercel environments)
const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
const isVercel = process.env.VERCEL === "1";

if (isProduction && !isVercel) {
  const clientDistPath = path.join(process.cwd(), "dist", "client");
  app.use(express.static(clientDistPath));
  
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else if (!isVercel) {
  app.get("/", (req, res) => {
    res.json({ ok: true, message: "AutoIntegrate server running" });
  });
}

// Only start listening if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    log.success(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
