import { r2 } from "./client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const data = Buffer.from(await req.arrayBuffer());
  const key = `upload-${Date.now()}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: data,
    })
  );

  return NextResponse.json({
    ok: true,
    key,
    publicUrl: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`,
  });
};
