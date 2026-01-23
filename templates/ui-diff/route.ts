import { NextRequest, NextResponse } from "next/server";
import { diffLines } from "diff";

export async function POST(req: NextRequest) {
  const { oldText, newText } = await req.json();
  const diff = diffLines(oldText, newText);
  return NextResponse.json({ diff });
}
