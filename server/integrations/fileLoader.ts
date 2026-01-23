// File Loader - Reads TS templates as strings

import fs from "fs";
import path from "path";

export interface LoadedTemplate {
  templateName: string;
  content: string;
  originalPath: string;
  extension: string;
}

export function loadIntegrationTemplates(name: string): LoadedTemplate[] {
  const dir = path.join(process.cwd(), "integrations", name, "templates");

  if (!fs.existsSync(dir)) {
    console.warn(`[FileLoader] Template folder missing for ${name}`);
    return [];
  }

  const files = fs.readdirSync(dir);

  return files
    .filter((file) => !file.startsWith(".")) // Skip hidden files
    .map((file) => {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const extension = path.extname(file);

      return {
        templateName: file,
        content,
        originalPath: filePath,
        extension,
      };
    });
}

export function loadIntegrationReadme(name: string): string | null {
  const readmePath = path.join(process.cwd(), "integrations", name, "readme.md");

  if (!fs.existsSync(readmePath)) {
    return null;
  }

  return fs.readFileSync(readmePath, "utf8");
}

export function loadIntegrationSchema(name: string): any | null {
  const schemaPath = path.join(process.cwd(), "integrations", name, "schema.json");

  if (!fs.existsSync(schemaPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}
