import { anthropic } from "./client";

export const claudeChat = async (prompt: string) => {
  return anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
};
