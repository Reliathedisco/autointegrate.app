// Generic Webhook Handler Example

import { verifyWebhookSignature } from "./init";

export async function handleWebhook(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-webhook-signature") || "";

  // Verify signature
  const isValid = verifyWebhookSignature(
    body,
    signature,
    process.env.WEBHOOK_SECRET!
  );

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Parse and process the webhook
  const payload = JSON.parse(body);
  const eventType = payload.type || payload.event || "unknown";

  console.log(`Webhook received: ${eventType}`);
  console.log("Payload:", payload);

  // Handle different event types
  switch (eventType) {
    case "user.created":
      // Handle user creation
      break;
    case "payment.completed":
      // Handle payment
      break;
    default:
      console.log("Unknown event type:", eventType);
  }

  return new Response("OK", { status: 200 });
}

export const POST = handleWebhook;
