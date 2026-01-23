# Razorpay Integration

Payment order creation for Indian market.

## Environment Variables

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## Usage

```typescript
import { razorpay } from "./client";

const order = await razorpay.orders.create({
  amount: 50000, // ₹500.00 in paise
  currency: "INR",
});
```
