import { limiter } from "./limit";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const ip = req.ip ?? "anonymous";
  const { success } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
};

