import { stripe } from "./init";
import { NextRequest, NextResponse } from "next/server";

export async function handleStripeWebhook(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // Handle successful checkout
        console.log("Checkout completed:", session.id);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        // Handle subscription changes
        console.log("Subscription updated:", subscription.id);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        // Handle successful payment
        console.log("Payment succeeded:", invoice.id);
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        // Handle failed payment
        console.log("Payment failed:", failedInvoice.id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
