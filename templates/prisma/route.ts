import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./client";

export const POST = async (req: NextRequest) => {
  const { email } = await req.json();

  const user = await prisma.user.create({
    data: { email },
  });

  return NextResponse.json({ ok: true, user });
};

