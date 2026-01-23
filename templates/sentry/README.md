# Sentry Monitoring

Captures server errors and traces.

## Environment Variables

```env
SENTRY_DSN=
```

## Usage

```typescript
import { Sentry } from "./client";

try {
  // Your code
} catch (err) {
  Sentry.captureException(err);
}

// Manual message
Sentry.captureMessage("Something happened");
```
