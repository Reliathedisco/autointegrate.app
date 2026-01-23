import { openai } from "./client";

export const embed = async (input: string) => {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });

  return res.data[0].embedding;
};
