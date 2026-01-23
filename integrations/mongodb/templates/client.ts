// MongoDB Query Example
import clientPromise from "./init";

export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getCollection<T>(collectionName: string, dbName?: string) {
  const db = await getDatabase(dbName);
  return db.collection<T>(collectionName);
}

// Example usage
export async function getUsers() {
  const collection = await getCollection("users");
  return collection.find({}).toArray();
}

export async function createUser(data: { email: string; name: string }) {
  const collection = await getCollection("users");
  return collection.insertOne(data);
}
