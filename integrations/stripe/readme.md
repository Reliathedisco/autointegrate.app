# Stripe Integration

Complete Stripe integration with checkout, subscriptions, and webhooks.

## Templates

- `init.ts` - Stripe client initialization
- `checkout.ts` - Checkout session creation
- `webhook.ts` - Webhook event handling

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Usage

```typescript
import { createCheckoutSession } from "./checkout";
import { handleStripeWebhook } from "./webhook";
```
