import fs from "fs-extra";
import path from "path";
import { SANDBOX_DIR } from "../config.js";

export async function listSandboxFiles() {
  await fs.ensureDir(SANDBOX_DIR);

  const files: string[] = [];
  
  async function walkDir(dir: string, prefix = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        await walkDir(fullPath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }
  
  await walkDir(SANDBOX_DIR);
  return files;
}

export async function readSandboxFile(filename: string) {
  const full = path.join(SANDBOX_DIR, filename);
  return fs.readFile(full, "utf8");
}

