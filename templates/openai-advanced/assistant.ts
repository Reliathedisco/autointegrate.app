import { openai } from "./client";

export const runAssistant = async (instructions: string, input: string) => {
  const assistant = await openai.beta.assistants.create({
    name: "AutoIntegrate Helper",
    instructions,
    model: "gpt-4o-mini",
  });

  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, { role: "user", content: input });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  return run;
};
