# Paddle Integration

Paddle price creation + checkout links.

## Environment Variables

```env
PADDLE_API_KEY=
```

## Usage

```typescript
import { createCheckout } from "./checkout";

const session = await createCheckout("pri_xxxx");
// Redirect user to session.url
```
