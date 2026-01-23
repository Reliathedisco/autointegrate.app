import { NextRequest, NextResponse } from "next/server";
import { createIssue } from "./issues";

export const POST = async (req: NextRequest) => {
  const { owner, repo, title, body } = await req.json();
  const issue = await createIssue(owner, repo, title, body);

  return NextResponse.json({ ok: true, issue });
};
