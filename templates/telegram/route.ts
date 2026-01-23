import { NextRequest, NextResponse } from "next/server";
import { telegramSend } from "./send";

export const POST = async (req: NextRequest) => {
  const { message } = await req.json();
  await telegramSend(message);

  return NextResponse.json({ ok: true });
};
