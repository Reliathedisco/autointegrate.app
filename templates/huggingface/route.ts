import { NextRequest, NextResponse } from "next/server";
import { hfRequest } from "./client";

export const POST = async (req: NextRequest) => {
  const { model, input } = await req.json();
  const out = await hfRequest(model, input);

  return NextResponse.json(out);
};
