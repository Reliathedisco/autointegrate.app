// OpenAI Chat Completion Example

import { openai } from "./init";

export async function chat(message: string) {
  const completion = await openai.responses.create({
    model: "gpt-4o-mini",
    input: message,
  });

  return completion.output_text;
}
