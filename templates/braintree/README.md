# Braintree Integration

Braintree client token + transaction sale.

## Environment Variables

```env
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=
```

## Usage

```typescript
import { gateway } from "./client";

// Create client token for frontend
const { clientToken } = await gateway.clientToken.generate({});

// Process transaction
const result = await gateway.transaction.sale({
  amount: "10.00",
  paymentMethodNonce: nonceFromClient,
  options: { submitForSettlement: true },
});
```
