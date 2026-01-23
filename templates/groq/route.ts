import { NextRequest, NextResponse } from "next/server";
import { groqRequest } from "./client";

export const POST = async (req: NextRequest) => {
  const { messages } = await req.json();
  const out = await groqRequest(messages);

  return NextResponse.json(out);
};
