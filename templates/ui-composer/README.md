# Drag-and-Drop Integration Composer

Visual builder for stitching together integrations.

## Usage

```tsx
import Composer from "./Composer";

<Composer />
```

## Features

- Click to add blocks to flow
- Remove blocks with ✕ button
- Export flow as JSON
- Visual flow connections

## Available Blocks

- 💳 Stripe Payment
- 📧 Send Email
- 🐙 GitHub Action
- 🤖 AI Task
- 🔗 Webhook
- 💬 Slack Message

## Customization

Add more blocks by extending the `blocks` array:

```typescript
const blocks = [
  { id: "custom", label: "Custom Block", icon: "⚡", category: "Custom" },
  // ...
];
```

## Use Cases

- Visual workflow builder
- Integration pipelines
- Automation sequences
- API orchestration
