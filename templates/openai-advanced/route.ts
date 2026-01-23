import { NextRequest, NextResponse } from "next/server";
import { chat } from "./chat";

export const POST = async (req: NextRequest) => {
  const { messages } = await req.json();
  const out = await chat(messages);

  return NextResponse.json(out);
};
