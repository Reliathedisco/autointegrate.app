// Replicate Run Model Example

import { replicate } from "./init";

export async function runModel(model: string, input: any) {
  return replicate.run(model as `${string}/${string}`, { input });
}

// Image generation example
export async function generateImage(prompt: string) {
  return runModel("stability-ai/sdxl:latest", {
    prompt,
    num_outputs: 1,
  });
}
