// R2 Upload Example

import { r2 } from "./init";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadR2(bucket: string, key: string, body: Buffer) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });

  return r2.send(command);
}
