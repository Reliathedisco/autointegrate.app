// Replicate Video Generation Example (e.g. ZeroScope)

import { replicate } from "./init";

export async function generateVideo(prompt: string) {
  return await replicate.run(
    "zeroscope/zeroscope:latest",
    { input: { prompt } }
  );
}
