# Groq Llama-3 Integration

Blazing-fast Llama-3 chat completions on Groq.

## Environment Variables

```env
GROQ_API_KEY=
```

## Usage

```typescript
import { groqRequest } from "./client";

const response = await groqRequest([
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "What is the capital of France?" }
]);

console.log(response.choices[0].message.content);
```

## Available Models

- `llama3-70b-8192` - Llama 3 70B (default)
- `llama3-8b-8192` - Llama 3 8B (faster)
- `mixtral-8x7b-32768` - Mixtral 8x7B
- `gemma-7b-it` - Gemma 7B
