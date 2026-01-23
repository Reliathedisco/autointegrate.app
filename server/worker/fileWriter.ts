import fs from "fs-extra";
import path from "path";
import { SANDBOX_DIR } from "../config.js";

export async function writeGeneratedFiles(jobId: string, files: Record<string, string>) {
  const root = path.join(SANDBOX_DIR, jobId);
  await fs.ensureDir(root);

  const written = [];

  for (const filePath of Object.keys(files)) {
    const full = path.join(root, filePath);
    await fs.ensureFile(full);
    await fs.writeFile(full, files[filePath]);

    written.push({
      path: `${jobId}/${filePath}`,
      contents: files[filePath]
    });
  }

  return written;
}

