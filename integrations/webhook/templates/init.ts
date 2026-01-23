// Generic Webhook Handler Initialization

import crypto from "crypto";

export interface WebhookConfig {
  secret: string;
  signatureHeader: string;
  algorithm?: "sha256" | "sha1";
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
  algorithm: "sha256" | "sha1" = "sha256"
): boolean {
  const hmac = crypto.createHmac(algorithm, secret);
  const expectedSig = hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
