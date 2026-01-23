# PostHog Integration

Tracks events and identifies users server-side.

## Environment Variables

```env
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
```

## Usage

```typescript
import { trackEvent, identifyUser } from "./events";

// Track an event
await trackEvent("user_signed_up", { plan: "pro" });

// Identify a user
await identifyUser("user_123", { email: "user@example.com", name: "John" });
```
