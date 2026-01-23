import { NextRequest, NextResponse } from "next/server";
import { setKV, getKV } from "./store";

export const POST = async (req: NextRequest) => {
  const { key, value } = await req.json();
  setKV(key, value);
  return NextResponse.json({ ok: true });
};

export const GET = async () => {
  const value = getKV("test");
  return NextResponse.json({ value });
};

