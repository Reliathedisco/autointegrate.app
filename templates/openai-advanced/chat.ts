import { openai } from "./client";

export const chat = async (messages: any[]) => {
  return openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
};
