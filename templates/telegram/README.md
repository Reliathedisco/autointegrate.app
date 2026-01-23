# Telegram Bot Integration

Send messages using Telegram Bot API.

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
```

## Usage

```typescript
import { telegramSend } from "./send";

await telegramSend("⚡ Server alert: CPU usage high!");
```

## Setup

1. Message @BotFather on Telegram
2. Create bot with `/newbot`
3. Copy the token
4. Get chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
