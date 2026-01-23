// Anthropic Tool Use Example

import { anthropic } from "./init";

const tools = [
  {
    name: "get_weather",
    description: "Get the current weather in a given location",
    input_schema: {
      type: "object" as const,
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
];

export async function claudeWithTools(prompt: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4096,
    tools,
    messages: [{ role: "user", content: prompt }],
  });

  return message;
}
