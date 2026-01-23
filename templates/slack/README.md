# Slack Bot Integration

Send messages to Slack channels.

## Environment Variables

```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL=#general
```

## Usage

```typescript
import { slackSend } from "./client";

await slackSend("🚀 New deployment successful!");
```

## Setup

1. Create a Slack App at https://api.slack.com/apps
2. Add `chat:write` bot scope
3. Install to workspace
4. Copy Bot User OAuth Token
