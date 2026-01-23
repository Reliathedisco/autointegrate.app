// Commit Injector - File Writer + Commit Machine

import fs from "fs";
import path from "path";

export interface CommitFile {
  path: string;
  content: string;
  type: "file" | "env" | "doc";
  integration?: string;
}

export interface WriteResult {
  path: string;
  success: boolean;
  error?: string;
}

// Ensure directory exists
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Write a single file, creating directories as needed
export function writeFileRecursive(
  baseDir: string,
  filePath: string,
  content: string
): string {
  const fullPath = path.join(baseDir, filePath);
  const dir = path.dirname(fullPath);

  ensureDir(dir);
  fs.writeFileSync(fullPath, content, "utf8");

  return fullPath;
}

// Check if file exists in target
export function fileExists(baseDir: string, filePath: string): boolean {
  const fullPath = path.join(baseDir, filePath);
  return fs.existsSync(fullPath);
}

// Read existing file content
export function readExistingFile(baseDir: string, filePath: string): string | null {
  const fullPath = path.join(baseDir, filePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf8");
}

// Commit all files to the repository directory
export function commitFiles(
  baseDir: string,
  files: CommitFile[],
  options: { overwrite?: boolean } = {}
): WriteResult[] {
  const results: WriteResult[] = [];
  const { overwrite = true } = options;

  console.log(`[Commit] Writing ${files.length} files to ${baseDir}`);

  for (const file of files) {
    try {
      // Check if file exists and we shouldn't overwrite
      if (!overwrite && fileExists(baseDir, file.path)) {
        console.log(`[Commit] Skipping existing file: ${file.path}`);
        results.push({
          path: file.path,
          success: true,
          error: "Skipped - file exists",
        });
        continue;
      }

      const fullPath = writeFileRecursive(baseDir, file.path, file.content);
      console.log(`[Commit] Wrote: ${file.path}`);

      results.push({
        path: fullPath,
        success: true,
      });
    } catch (err: any) {
      console.error(`[Commit] Failed to write ${file.path}:`, err.message);
      results.push({
        path: file.path,
        success: false,
        error: err.message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[Commit] Successfully wrote ${successCount}/${files.length} files`);

  return results;
}

// Generate diff summary
export function generateDiffSummary(files: CommitFile[]): string {
  const byType = {
    file: files.filter((f) => f.type === "file").length,
    env: files.filter((f) => f.type === "env").length,
    doc: files.filter((f) => f.type === "doc").length,
  };

  const integrations = [...new Set(files.map((f) => f.integration).filter(Boolean))];

  return `
## AutoIntegrate Commit Summary

**Files Added:** ${files.length}
- Source files: ${byType.file}
- Environment files: ${byType.env}
- Documentation: ${byType.doc}

**Integrations:** ${integrations.join(", ")}

### Files
${files.map((f) => `- \`${f.path}\``).join("\n")}
`.trim();
}
