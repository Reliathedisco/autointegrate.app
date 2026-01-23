import clientPromise from "./client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { email } = await req.json();
  const client = await clientPromise;
  const db = client.db("app");

  const result = await db.collection("users").insertOne({ email });

  return NextResponse.json({ ok: true, insertedId: result.insertedId });
};

