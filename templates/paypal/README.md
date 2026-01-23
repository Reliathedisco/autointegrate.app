# PayPal Orders API

Supports:
- Order creation
- Payment capture

## Environment Variables

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox # or live
```

## Usage

```typescript
import { createOrder } from "./create-order";
import { captureOrder } from "./capture-order";

// Create order
const order = await createOrder("29.99");

// Capture payment
const captured = await captureOrder(order.id);
```
