import { NextRequest, NextResponse } from "next/server";
import { createPage } from "./createPage";

export const POST = async (req: NextRequest) => {
  const { title } = await req.json();
  const page = await createPage(title);

  return NextResponse.json({ ok: true, page });
};
