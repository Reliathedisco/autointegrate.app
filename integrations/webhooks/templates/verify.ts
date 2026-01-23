// Webhook Verification Utilities
import crypto from "crypto";

// Verify HMAC signature
export function verifyHmac(body: string, signature: string, secret: string, algorithm = "sha256") {
  const hmac = crypto.createHmac(algorithm, secret);
  const digest = hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Verify with prefix (e.g., "sha256=...")
export function verifyWithPrefix(body: string, signature: string, secret: string) {
  const [algorithm, hash] = signature.split("=");
  return verifyHmac(body, hash, secret, algorithm);
}

// Verify timestamp (prevent replay attacks)
export function verifyTimestamp(timestamp: string | number, toleranceSeconds = 300) {
  const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - ts) <= toleranceSeconds;
}

// Combined verification
export function verifyWebhook(
  body: string,
  signature: string,
  timestamp: string | number,
  secret: string,
  options?: { algorithm?: string; toleranceSeconds?: number }
) {
  const { algorithm = "sha256", toleranceSeconds = 300 } = options || {};

  if (!verifyTimestamp(timestamp, toleranceSeconds)) {
    return { valid: false, error: "Timestamp expired" };
  }

  const signedPayload = `${timestamp}.${body}`;
  const isValid = verifyHmac(signedPayload, signature, secret, algorithm);

  return { valid: isValid, error: isValid ? null : "Invalid signature" };
}
