# Vercel AI SDK Integration

Streaming AI responses using Vercel's AI SDK.

## Environment Variables

```env
OPENAI_API_KEY=
```

## Installation

```bash
npm install ai @ai-sdk/openai
```

## Usage

### Server Route
```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const result = streamText({
  model: openai("gpt-4o-mini"),
  prompt: "Write a poem about coding",
});

return result.toDataStreamResponse();
```

### Client Component
```typescript
"use client";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

## Supported Providers

- `@ai-sdk/openai` - OpenAI
- `@ai-sdk/anthropic` - Anthropic Claude
- `@ai-sdk/google` - Google Gemini
- `@ai-sdk/mistral` - Mistral
