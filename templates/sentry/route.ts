import { NextResponse } from "next/server";
import { Sentry } from "./client";

export const GET = async () => {
  try {
    throw new Error("Sentry test error 🌋");
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ ok: true, sent: true });
  }
};
