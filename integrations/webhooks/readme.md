# Generic Webhook Handler Integration

Webhook handling with signature verification.

## Templates

- `init.ts` - Basic signature verification
- `handler.ts` - Webhook route handler
- `verify.ts` - Advanced verification utilities

## Environment Variables

```env
WEBHOOK_SECRET=xxx
```

## Usage

```typescript
import { handleWebhook } from "./handler";

export const POST = handleWebhook;
```
