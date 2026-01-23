import OpenAI from "openai";
import { AI_MODEL } from "../config.js";

// Lazy initialization - only create client when needed
let client: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return client;
}

export async function explainError(error: string) {
  const openai = getClient();
  if (!openai) {
    return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
  }

  const prompt = `
You are an integration assistant. Explain this error in simple terms and provide a solution:

Error:
${error}
  `;

  const res = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}

export async function generateEnvInstructions(integration: string) {
  const openai = getClient();
  if (!openai) {
    return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
  }

  const prompt = `
Provide environment variable setup instructions for the integration: ${integration}.
List required variables and where to put them in a .env file.
  `;

  const res = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}

export async function explainCode(fileContent: string, fileName: string, integrationName: string) {
  const openai = getClient();
  if (!openai) {
    return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
  }

  const prompt = `
You are an expert code documentation assistant. Analyze the following code file and provide a clear, helpful explanation.

**File Name:** ${fileName}
**Integration:** ${integrationName || "Unknown"}

**Code:**
\`\`\`
${fileContent}
\`\`\`

Please provide an explanation in the following format:

## Why This File Exists
Explain the purpose of this file in the context of the integration/project.

## What It Does
Provide a detailed breakdown of the functionality:
- Key functions/exports and their purposes
- How it connects to other parts of the system
- Any external services or APIs it interacts with

## What's Safe to Modify
List specific parts that can be customized:
- Configuration values that can be changed
- Functions that can be extended
- Things to avoid changing (critical for the integration to work)

Keep the explanation clear and concise, suitable for developers who want to understand and potentially customize this code.
  `;

  const res = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}
