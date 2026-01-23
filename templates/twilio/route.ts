import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "./send";

export const POST = async (req: NextRequest) => {
  const { to, message } = await req.json();
  const out = await sendSMS(to, message);

  return NextResponse.json({ ok: true, out });
};
