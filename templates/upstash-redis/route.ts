import { redis } from "./client";
import { NextResponse } from "next/server";

export const GET = async () => {
  await redis.set("hello", "world");
  const value = await redis.get("hello");

  return NextResponse.json({ value });
};

