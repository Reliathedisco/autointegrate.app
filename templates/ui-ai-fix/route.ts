import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a code fixing assistant. Fix the provided code and return ONLY the corrected version without explanations or markdown formatting.",
      },
      {
        role: "user",
        content: `Fix the following code:\n\n${code}`,
      },
    ],
  });

  return NextResponse.json({
    fixed: completion.choices[0]?.message?.content || code,
  });
}
