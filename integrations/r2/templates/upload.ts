// Cloudflare R2 Upload Example

import { r2 } from "./init";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToR2(key: string, body: Buffer) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: body,
  });

  return r2.send(command);
}
