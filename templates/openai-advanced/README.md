# OpenAI Advanced

Supports:
- Chat Completions
- Embeddings
- Assistants (beta)

## Environment Variables

```env
OPENAI_API_KEY=
```

## Usage

### Chat Completions
```typescript
import { chat } from "./chat";

const response = await chat([
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello!" }
]);
```

### Embeddings
```typescript
import { embed } from "./embeddings";

const vector = await embed("Hello world");
// Returns 1536-dimensional vector
```

### Assistants
```typescript
import { runAssistant } from "./assistant";

const run = await runAssistant(
  "You are a code review assistant",
  "Review this function: function add(a, b) { return a + b; }"
);
```
