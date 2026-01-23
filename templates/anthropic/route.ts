import { NextRequest, NextResponse } from "next/server";
import { claudeChat } from "./chat";

export const POST = async (req: NextRequest) => {
  const { prompt } = await req.json();
  const out = await claudeChat(prompt);

  return NextResponse.json(out);
};
