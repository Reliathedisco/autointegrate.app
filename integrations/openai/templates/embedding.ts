// OpenAI Embedding Example

import { openai } from "./init";

export async function createEmbedding(text: string) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return embedding.data[0].embedding;
}
