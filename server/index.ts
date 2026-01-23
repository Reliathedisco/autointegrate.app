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
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth/index.js";

import { log } from "./utils/logger.js";

// Start worker
import "./worker/index.js";

const app = express();

app.use(cors());

// Stripe webhook must be registered BEFORE bodyParser.json()
app.use("/api/stripe/webhook", stripeWebhookRoutes);

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Replit Auth (must be before other routes)
// If you're using Clerk-only auth, REPL_ID may be unset. In that case we skip
// Replit OIDC session auth and rely on Clerk Bearer tokens for /api/me, etc.
const canUseReplitAuth =
  Boolean(process.env.REPL_ID) &&
  Boolean(process.env.SESSION_SECRET) &&
  Boolean(process.env.DATABASE_URL);

if (canUseReplitAuth) {
  await setupAuth(app);
} else {
  log.warn(
    "[Auth] Replit auth disabled (missing REPL_ID/SESSION_SECRET/DATABASE_URL). Using Clerk token auth only."
  );
}

registerAuthRoutes(app);

// --- ROUTES ---
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

// In production, serve the built frontend
const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";

if (isProduction) {
  const clientDistPath = path.join(process.cwd(), "dist", "client");
  app.use(express.static(clientDistPath));
  
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
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
