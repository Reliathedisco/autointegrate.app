// MongoDB Example Query

import { mongo } from "./init";

export async function getRecords() {
  return mongo.collection("records").find({}).toArray();
}
