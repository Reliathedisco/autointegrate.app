// MongoDB Insert Example

import { mongo } from "./init";

export async function addRecord(data: any) {
  return mongo.collection("records").insertOne(data);
}
