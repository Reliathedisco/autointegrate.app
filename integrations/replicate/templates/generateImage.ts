// Replicate Image Generation Example (e.g. Stable Diffusion)

import { replicate } from "./init";

export async function generateImage(prompt: string) {
  return await replicate.run(
    "stability-ai/stable-diffusion:latest",
    { input: { prompt } }
  );
}
