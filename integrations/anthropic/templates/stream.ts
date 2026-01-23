// Anthropic Streaming Example

import { anthropic } from "./init";

export async function claudeStream(prompt: string) {
  return anthropic.messages.stream({
    model: "claude-3-haiku-20240307",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
}

// Usage with async iterator
export async function streamToConsole(prompt: string) {
  const stream = await claudeStream(prompt);

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text);
    }
  }
}
