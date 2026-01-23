import { NextRequest, NextResponse } from "next/server";
import { exampleLogin } from "./handler";

export const POST = async (req: NextRequest) => {
  const { email, password } = await req.json();

  try {
    const user = await exampleLogin(email, password);
    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
};

