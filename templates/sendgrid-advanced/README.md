# SendGrid Advanced Integration

Transactional emails with dynamic templates.

## Environment Variables

```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM=noreply@yourdomain.com
```

## Usage

```typescript
import { sendTransactional } from "./send";

await sendTransactional(
  "user@example.com",
  "d-abc123", // Template ID from SendGrid
  {
    name: "John",
    order_id: "12345",
    total: "$99.00"
  }
);
```

## Setup

1. Create account at https://sendgrid.com
2. Verify sender identity
3. Create Dynamic Template in the dashboard
4. Copy Template ID (starts with `d-`)
