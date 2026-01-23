import { NextRequest, NextResponse } from "next/server";
import { pool } from "./client";

export const GET = async () => {
  const result = await pool.query("SELECT NOW()");
  return NextResponse.json({ now: result.rows[0].now });
};

