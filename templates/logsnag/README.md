# LogSnag Integration

Simple activity feed + alert system.

## Environment Variables

```env
LOGSNAG_TOKEN=
LOGSNAG_PROJECT=
```

## Usage

```typescript
import { logsnag } from "./client";

await logsnag("payments", "New Sale", "User purchased Pro plan for $29");
await logsnag("auth", "New Signup", "user@example.com joined");
```
