import Stripe from "stripe";

type StripeConnectionSettingsResponse = {
  items?: Array<{
    settings?: {
      secret?: string;
      webhook_secret?: string;
    };
  }>;
};

async function getReplitStripeConnectionSettings(): Promise<{
  secret: string;
  webhookSecret?: string;
}> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname) {
    throw new Error("REPLIT_CONNECTORS_HOSTNAME not set");
  }
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found (REPL_IDENTITY/WEB_REPL_RENEWAL)");
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      X_REPLIT_TOKEN: xReplitToken,
    },
  });

  const data = (await response.json()) as StripeConnectionSettingsResponse;
  const connectionSettings = data.items?.[0];

  const secret = connectionSettings?.settings?.secret;
  if (!secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return {
    secret,
    webhookSecret: connectionSettings?.settings?.webhook_secret,
  };
}

export async function getStripeClient(): Promise<Stripe> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (secret) {
    return new Stripe(secret);
  }

  const { secret: replitSecret } = await getReplitStripeConnectionSettings();
  return new Stripe(replitSecret, { apiVersion: "2025-08-27.basil" as any });
}

export async function getStripeWebhookSecret(): Promise<string> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) return webhookSecret;

  const { webhookSecret: replitWebhookSecret } =
    await getReplitStripeConnectionSettings();
  if (!replitWebhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }
  return replitWebhookSecret;
}

