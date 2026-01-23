// HuggingFace Initialization Template
const HF_API_URL = "https://api-inference.huggingface.co/models";

export async function hfInference(model: string, inputs: any) {
  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  });

  return response.json();
}
