// Pinecone Vector Query Example

import { pinecone } from "./init";

export async function searchVectors(indexName: string, vector: number[]) {
  const index = pinecone.index(indexName);
  return index.query({ vector, topK: 5 });
}
