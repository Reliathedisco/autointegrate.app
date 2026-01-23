import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const POST = async (req: NextRequest) => {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  return result.toDataStreamResponse();
};
