// AWS S3 Get File Example

import { s3 } from "./init";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getFile(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return s3.send(command);
}
