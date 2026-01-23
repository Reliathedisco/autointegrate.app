// R2 Get File Example

import { r2 } from "./init";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getR2File(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return r2.send(command);
}
