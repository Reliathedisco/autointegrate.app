// Replicate Prediction Example
import { replicate } from "./init";

export async function runModel(model: string, input: Record<string, any>) {
  const output = await replicate.run(model as `${string}/${string}`, { input });
  return output;
}

// Image generation example
export async function generateImage(prompt: string) {
  return runModel("stability-ai/stable-diffusion:latest", {
    prompt,
    num_outputs: 1,
  });
}

// Text generation example
export async function generateText(prompt: string) {
  return runModel("meta/llama-2-70b-chat:latest", {
    prompt,
    max_tokens: 500,
  });
}

// Async prediction with webhook
export async function createPrediction(model: string, input: Record<string, any>, webhookUrl?: string) {
  return replicate.predictions.create({
    version: model,
    input,
    webhook: webhookUrl,
    webhook_events_filter: ["completed"],
  });
}
