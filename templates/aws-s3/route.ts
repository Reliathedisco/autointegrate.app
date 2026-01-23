import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "./upload";

export const POST = async (req: NextRequest) => {
  const data = Buffer.from(await req.arrayBuffer());
  const url = await uploadToS3(`upload-${Date.now()}`, data);
  return NextResponse.json({ ok: true, url });
};
