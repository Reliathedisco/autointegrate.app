// Cloudflare R2 Get File Example

import { r2 } from "./init";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getFromR2(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  return r2.send(command);
}
