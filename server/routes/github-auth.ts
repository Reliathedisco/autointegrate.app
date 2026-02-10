// GitHub OAuth Authentication Routes

import { Router } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { db } from "../db.js";
import { users } from "../../shared/models/auth.js";
import { eq } from "drizzle-orm";
import { PORT } from "../config.js";

const router = Router();

// Check if GitHub OAuth is configured
const isGitHubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);

function getCallbackURL(): string {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  // Use production URL in production, otherwise use APP_URL or localhost
  if (isProduction && process.env.PRODUCTION_URL) {
    return `${process.env.PRODUCTION_URL}/api/auth/github/callback`;
  }

  if (process.env.APP_URL) {
    return `${process.env.APP_URL}/api/auth/github/callback`;
  }

  // Default to localhost for development
  return `http://localhost:${PORT}/api/auth/github/callback`;
}

if (isGitHubConfigured) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: getCallbackURL(),
        scope: ["user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void
      ) => {
        try {
          // Get primary email from GitHub profile
          const email =
            profile.emails?.[0]?.value ||
            `${profile.username}@github.local`;

          if (!email || email.endsWith("@github.local")) {
            console.warn(
              `[GitHub Auth] No email found for user ${profile.username}, using fallback`
            );
          }

          // Check if user exists by GitHub ID first, then by email
          let existingUser = await db
            .select()
            .from(users)
            .where(eq(users.githubId, profile.id))
            .then((rows) => rows[0]);

          if (!existingUser && email) {
            existingUser = await db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .then((rows) => rows[0]);
          }

          let user;

          if (existingUser) {
            // Update existing user with GitHub info
            [user] = await db
              .update(users)
              .set({
                githubId: profile.id,
                profileImageUrl:
                  profile.photos?.[0]?.value || existingUser.profileImageUrl,
                firstName:
                  profile.displayName?.split(" ")[0] || existingUser.firstName,
                lastName:
                  profile.displayName?.split(" ").slice(1).join(" ") ||
                  existingUser.lastName,
                updatedAt: new Date(),
              })
              .where(eq(users.id, existingUser.id))
              .returning();

            console.log(
              `[GitHub Auth] Updated existing user ${user.id} (${user.email})`
            );
          } else {
            // Create new user
            [user] = await db
              .insert(users)
              .values({
                email,
                githubId: profile.id,
                firstName: profile.displayName?.split(" ")[0] || profile.username,
                lastName: profile.displayName?.split(" ").slice(1).join(" ") || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                hasPaid: false,
              })
              .returning();

            console.log(
              `[GitHub Auth] Created new user ${user.id} (${user.email})`
            );
          }

          done(null, user);
        } catch (error) {
          console.error("[GitHub Auth] Error in strategy:", error);
          done(error);
        }
      }
    )
  );

  // Serialize user ID to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  console.log("[GitHub Auth] Strategy configured");
} else {
  console.warn(
    "[GitHub Auth] GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set. GitHub auth disabled."
  );
}

// Initiate GitHub OAuth flow
router.get("/github", (req, res, next) => {
  if (!isGitHubConfigured) {
    return res.status(503).json({
      error: "GitHub authentication is not configured",
    });
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

// GitHub OAuth callback
router.get(
  "/github/callback",
  (req, res, next) => {
    if (!isGitHubConfigured) {
      return res.redirect("/?error=github_not_configured");
    }
    passport.authenticate("github", {
      failureRedirect: "/?error=auth_failed",
    })(req, res, next);
  },
  (req: any, res) => {
    // Store user ID in session for compatibility with existing auth middleware
    if (req.user?.id) {
      req.session.userId = req.user.id;
      req.session.email = req.user.email;
      console.log(
        `[GitHub Auth] Session created for user ${req.user.id} (${req.user.email})`
      );
    }

    // Check if user has paid to determine redirect
    const hasPaid = req.user?.hasPaid === true;
    if (hasPaid) {
      res.redirect("/");
    } else {
      res.redirect("/billing");
    }
  }
);

// Logout
router.post("/logout", (req: any, res) => {
  // Clear session data
  if (req.session) {
    req.session.userId = null;
    req.session.email = null;
  }

  // Passport logout
  req.logout?.((err: any) => {
    if (err) {
      console.error("[GitHub Auth] Logout error:", err);
    }
  });

  // Destroy session
  req.session?.destroy?.((err: any) => {
    if (err) {
      console.error("[GitHub Auth] Session destroy error:", err);
    }
  });

  res.json({ success: true });
});

// Also support GET for logout (for redirect-based logout)
router.get("/logout", (req: any, res) => {
  if (req.session) {
    req.session.userId = null;
    req.session.email = null;
  }

  req.logout?.((err: any) => {
    if (err) {
      console.error("[GitHub Auth] Logout error:", err);
    }
  });

  req.session?.destroy?.((err: any) => {
    if (err) {
      console.error("[GitHub Auth] Session destroy error:", err);
    }
  });

  res.redirect("/");
});

export default router;
