import { NextResponse } from "next/server";
import { redis } from "./client";

export const GET = async () => {
  await redis.set("ping", "pong");
  const value = await redis.get("ping");

  return NextResponse.json({ value });
};

