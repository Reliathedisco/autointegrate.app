import { uploadToGCS } from "./upload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const data = Buffer.from(await req.arrayBuffer());
  const filename = `upload-${Date.now()}`;
  const url = await uploadToGCS(filename, data);

  return NextResponse.json({ ok: true, url });
};
