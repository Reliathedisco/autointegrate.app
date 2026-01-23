import { NextRequest, NextResponse } from "next/server";
import { createLinearIssue } from "./createIssue";

export const POST = async (req: NextRequest) => {
  const { teamId, title, description } = await req.json();
  const out = await createLinearIssue(teamId, title, description);

  return NextResponse.json({ ok: true, out });
};
