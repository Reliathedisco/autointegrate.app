import { Router, Request, Response } from "express";
import express from "express";
import type Stripe from "stripe";
import { db } from "../db.js";
import { users, paymentEvents } from "../../shared/models/auth.js";
import { eq } from "drizzle-orm";
import { getStripeClient, getStripeWebhookSecret } from "../utils/stripe.js";

const router = Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    const timestamp = new Date().toISOString();

    console.log(`[Stripe Webhook] ${timestamp} - Received webhook request`);

    if (!signature) {
      console.error(`[Stripe Webhook] ${timestamp} - Missing stripe-signature header`);
      return res.status(400).json({ error: "Missing stripe-signature" });
    }

    try {
      const stripe = await getStripeClient();
      const webhookSecret = await getStripeWebhookSecret();
      const sig = Array.isArray(signature) ? signature[0] : signature;

      const event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        webhookSecret
      );

      console.log(`[Stripe Webhook] ${timestamp} - Event type: ${event.type}, Event ID: ${event.id}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerEmail = session.customer_details?.email;
        const paymentStatus = session.payment_status;
        const amountTotal = session.amount_total;

        console.log(`[Stripe Webhook] ${timestamp} - Checkout completed:`);
        console.log(`  - Session ID: ${session.id}`);
        console.log(`  - User ID (client_reference_id): ${userId || "MISSING"}`);
        console.log(`  - Customer Email: ${customerEmail || "N/A"}`);
        console.log(`  - Payment Status: ${paymentStatus}`);
        console.log(`  - Amount: ${amountTotal ? `$${amountTotal / 100}` : "N/A"}`);

        // Log payment event for debugging
        await db.insert(paymentEvents).values({
          userId: userId || null,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string || null,
          amount: amountTotal ? `${amountTotal / 100}` : null,
          status: paymentStatus === "paid" ? "completed" : "pending",
          metadata: {
            customerEmail,
            paymentStatus,
            mode: session.mode,
          },
        });

        if (userId) {
          const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
          
          if (existingUser) {
            // Idempotency check: skip if already paid
            if (existingUser.hasPaid) {
              console.log(`[Stripe Webhook] ${timestamp} - SKIP: User ${userId} already marked as paid`);
              return res.status(200).json({ received: true, skipped: true });
            }

            await db
              .update(users)
              .set({
                hasPaid: "true",
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId));

            console.log(`[Stripe Webhook] ${timestamp} - SUCCESS: Updated hasPaid=true for user ${userId} (${existingUser.email})`);
          } else {
            console.error(`[Stripe Webhook] ${timestamp} - ERROR: User ${userId} not found in database`);
            
            // Update payment event to failed
            await db.update(paymentEvents)
              .set({ status: "failed", metadata: { error: "User not found" } })
              .where(eq(paymentEvents.stripeSessionId, session.id));
          }
        } else {
          console.warn(`[Stripe Webhook] ${timestamp} - WARNING: No client_reference_id in session - payment cannot be linked to user`);
          
          // Update payment event to failed
          await db.update(paymentEvents)
            .set({ status: "failed", metadata: { error: "No client_reference_id" } })
            .where(eq(paymentEvents.stripeSessionId, session.id));
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(`[Stripe Webhook] ${timestamp} - ERROR: ${error.message}`);
      console.error(`[Stripe Webhook] ${timestamp} - Stack: ${error.stack}`);
      res.status(400).json({ error: "Webhook processing error" });
    }
  }
);

export default router;
