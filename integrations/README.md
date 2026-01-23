# AutoIntegrate - Integration System

This is the auto-generated integrations system that powers AutoIntegrate.

## Structure

```
integrations/
├── integrations.json      # Global registry of all integrations
├── README.md
├── stripe/
│   ├── templates/
│   │   ├── init.ts
│   │   ├── checkout.ts
│   │   └── webhook.ts
│   ├── readme.md
│   └── schema.json
├── clerk/
│   ├── templates/
│   │   ├── init.ts
│   │   └── middleware.ts
│   └── readme.md
├── supabase/
│   └── templates/
├── openai/
│   └── templates/
└── resend/
    └── templates/
```

## Adding New Integrations

1. Add entry to `integrations.json`:

```json
{
  "my-integration": {
    "name": "My Integration",
    "category": "category",
    "description": "Description here",
    "env": ["API_KEY"],
    "hasWebhook": false,
    "templates": ["init", "client"]
  }
}
```

2. Create template folder:

```
integrations/my-integration/templates/init.ts
integrations/my-integration/templates/client.ts
integrations/my-integration/readme.md
```

3. Templates are automatically picked up by the generator.

## Generator API

```typescript
import { generateIntegration, generateWithEnv } from "./server/integrations/generator";

// Generate single integration
const files = await generateIntegration("stripe");

// Generate multiple with env vars
const { files, envVars } = await generateWithEnv(["stripe", "clerk", "openai"]);
```

## Categories

- `payments` - Stripe, Paddle, LemonSqueezy
- `auth` - Clerk, NextAuth, Auth0
- `database` - Supabase, PlanetScale, MongoDB
- `email` - Resend, SendGrid
- `ai` - OpenAI, Anthropic, HuggingFace
- `storage` - S3, R2, GCS, UploadThing
- `devtools` - GitHub, Vercel, GitLab
- `realtime` - Ably, Liveblocks
- `automation` - Cron, Webhooks
