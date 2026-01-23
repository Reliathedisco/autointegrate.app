// Pinecone Upsert Example

import { pinecone } from "./init";

export async function upsertEmbeddings(indexName: string, vectors: any[]) {
  const index = pinecone.index(indexName);
  return index.upsert(vectors);
}
