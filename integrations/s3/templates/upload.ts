// AWS S3 Upload Example

import { s3 } from "./init";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(bucket: string, key: string, body: Buffer) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });

  return s3.send(command);
}
