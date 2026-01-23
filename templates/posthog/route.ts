import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "./events";

export const POST = async (req: NextRequest) => {
  const { event, data } = await req.json();
  await trackEvent(event, data);
  return NextResponse.json({ ok: true });
};
