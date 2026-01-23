import fs from "fs";
import path from "path";
import { GeneratedFile } from "./generator.js";

export interface InjectionResult {
  success: boolean;
  path: string;
  error?: string;
}

export async function injectFiles(
  files: GeneratedFile[],
  targetDir: string
): Promise<InjectionResult[]> {
  const results: InjectionResult[] = [];

  for (const file of files) {
    const targetPath = path.join(targetDir, file.path);
    const targetFolder = path.dirname(targetPath);

    try {
      // Ensure directory exists
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Write file
      fs.writeFileSync(targetPath, file.content, "utf8");

      results.push({
        success: true,
        path: targetPath,
      });
    } catch (err: any) {
      results.push({
        success: false,
        path: targetPath,
        error: err.message,
      });
    }
  }

  return results;
}

export async function injectEnvFile(
  envContent: string,
  targetDir: string,
  filename = ".env.local"
): Promise<InjectionResult> {
  const targetPath = path.join(targetDir, filename);

  try {
    // Append to existing .env or create new
    if (fs.existsSync(targetPath)) {
      const existing = fs.readFileSync(targetPath, "utf8");
      fs.writeFileSync(targetPath, existing + "\n" + envContent, "utf8");
    } else {
      fs.writeFileSync(targetPath, envContent, "utf8");
    }

    return { success: true, path: targetPath };
  } catch (err: any) {
    return { success: false, path: targetPath, error: err.message };
  }
}

export async function injectWebhookRoute(
  integration: string,
  targetDir: string
): Promise<InjectionResult> {
  const routePath = path.join(
    targetDir,
    "app",
    "api",
    "webhooks",
    integration,
    "route.ts"
  );

  const routeContent = `
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Handle ${integration} webhook
  console.log("${integration} webhook received:", body);
  
  return NextResponse.json({ received: true });
}
`.trim();

  try {
    const folder = path.dirname(routePath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    fs.writeFileSync(routePath, routeContent, "utf8");
    return { success: true, path: routePath };
  } catch (err: any) {
    return { success: false, path: routePath, error: err.message };
  }
}
