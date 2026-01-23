import { NextRequest, NextResponse } from "next/server";
import { slackSend } from "./client";

export const POST = async (req: NextRequest) => {
  const { message } = await req.json();
  const out = await slackSend(message);

  return NextResponse.json({ ok: true, out });
};
