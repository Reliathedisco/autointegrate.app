import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./client";

export const uploadToS3 = async (key: string, body: Buffer) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: "application/octet-stream",
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
};
