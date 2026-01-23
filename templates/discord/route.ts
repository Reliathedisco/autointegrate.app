import { NextRequest, NextResponse } from "next/server";
import { discordSend } from "./send";

export const POST = async (req: NextRequest) => {
  const { message } = await req.json();
  await discordSend(message);

  return NextResponse.json({ ok: true });
};
