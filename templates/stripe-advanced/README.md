# Stripe Advanced Pack

Full subscription stack with checkout, billing portal, and webhooks.

## Environment Variables

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Structure

```
stripe-advanced/
├── config.ts
├── subscriptions/
│   ├── checkout.ts    # Create subscription checkout sessions
│   └── route.ts       # POST /api/checkout
├── customer-portal/
│   ├── portal.ts      # Create billing portal sessions
│   └── route.ts       # POST /api/portal
├── webhooks/
│   └── route.ts       # POST /api/webhooks/stripe
└── pricing/
    ├── prices.ts      # List and create prices
    └── route.ts       # GET /api/prices
```

## Usage

### Create Subscription Checkout
```typescript
import { createCheckout } from "./subscriptions/checkout";
const session = await createCheckout("price_xxx");
// Redirect to session.url
```

### Open Billing Portal
```typescript
import { createBillingPortal } from "./customer-portal/portal";
const portal = await createBillingPortal("cus_xxx");
// Redirect to portal.url
```

### Webhook Events
Handles:
- `customer.subscription.created`
- `invoice.payment_succeeded`
- `checkout.session.completed`
