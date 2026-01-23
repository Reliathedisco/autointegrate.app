import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./client";

export const POST = async (req: NextRequest) => {
  const data = Buffer.from(await req.arrayBuffer());
  const filename = `upload-${Date.now()}`;

  const { data: uploaded, error } = await supabase.storage
    .from("uploads")
    .upload(filename, data, {
      contentType: "application/octet-stream",
    });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    path: uploaded?.path,
  });
};
