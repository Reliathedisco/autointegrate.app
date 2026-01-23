# Discord Webhook Integration

Send messages through a Discord webhook.

## Environment Variables

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## Usage

```typescript
import { discordSend } from "./send";

await discordSend("🎉 New user signed up!");
```

## Setup

1. Go to your Discord server
2. Edit Channel → Integrations → Webhooks
3. Create Webhook and copy URL
