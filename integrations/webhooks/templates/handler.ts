// Generic Webhook Handler Example
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "./init";

export async function handleWebhook(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-webhook-signature") || "";

  // Verify signature
  const isValid = verifySignature(
    body,
    signature,
    process.env.WEBHOOK_SECRET!
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventType = payload.type || payload.event;

  // Handle different event types
  switch (eventType) {
    case "user.created":
      console.log("New user:", payload.data);
      break;
    case "payment.completed":
      console.log("Payment completed:", payload.data);
      break;
    default:
      console.log("Unknown event:", eventType);
  }

  return NextResponse.json({ received: true });
}

export const POST = handleWebhook;
