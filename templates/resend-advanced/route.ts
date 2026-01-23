import { NextRequest, NextResponse } from "next/server";
import { sendWelcome } from "./send";

export const POST = async (req: NextRequest) => {
  const { email, user } = await req.json();
  await sendWelcome(email, user);

  return NextResponse.json({ ok: true });
};
