# Anthropic Claude Integration

Claude-3 Messages API with tool support.

## Environment Variables

```env
ANTHROPIC_API_KEY=
```

## Usage

```typescript
import { claudeChat } from "./chat";

const response = await claudeChat("Explain quantum computing in simple terms");
console.log(response.content[0].text);
```

## Available Models

- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-haiku-20240307` - Fastest (default)
