import { NextRequest, NextResponse } from "next/server";
import { db } from "./client";

export const GET = async () => {
  const result = await db.execute("SELECT NOW()");
  return NextResponse.json({ now: result.rows[0] });
};

