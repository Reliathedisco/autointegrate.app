# Generic Webhook Handler Integration

Handle incoming webhooks from any service with signature verification.

## Templates

- `init.ts` - Signature verification utilities
- `handler.ts` - Webhook route handler
- `queue.ts` - Async webhook processing queue

## Environment Variables

```env
WEBHOOK_SECRET=your-secret-here
```

## Usage

```typescript
import { handleWebhook } from "./handler";

export const POST = handleWebhook;
```

## Supported Signature Algorithms

- SHA256 (default)
- SHA1 (legacy)
