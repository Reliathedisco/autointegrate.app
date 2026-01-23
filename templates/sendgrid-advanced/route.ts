import { NextRequest, NextResponse } from "next/server";
import { sendTransactional } from "./send";

export const POST = async (req: NextRequest) => {
  const { to, templateId, data } = await req.json();
  await sendTransactional(to, templateId, data);

  return NextResponse.json({ ok: true });
};
