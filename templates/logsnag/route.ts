import { NextRequest, NextResponse } from "next/server";
import { logsnag } from "./client";

export const POST = async (req: NextRequest) => {
  const { event, channel, description } = await req.json();
  const out = await logsnag(channel, event, description);
  return NextResponse.json({ ok: true, out });
};
