// Temporary Repository Management

import { cloneRepository } from "../worker/clone.js";
import os from "os";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";

// Track active sandbox sessions
const activeSessions: Map<string, { path: string; createdAt: Date }> = new Map();

// Clone a repository to a temporary directory
// Returns { sessionId, workspacePath } to ensure consistent ID usage
export async function cloneToTemp(repoUrl: string, token?: string): Promise<{ sessionId: string; workspacePath: string }> {
  const sessionId = uuid();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "autointegrate-"));
  
  console.log(`[Sandbox] Creating temp session: ${sessionId}`);
  console.log(`[Sandbox] Temp directory: ${tempDir}`);
  
  // Clone to temp directory
  await cloneRepository(repoUrl, sessionId, token);
  
  // Move from default tmp location to our temp dir
  const defaultTmpPath = path.join(process.cwd(), "tmp", sessionId);
  
  if (fs.existsSync(defaultTmpPath)) {
    // Copy contents to our temp directory
    copyDirRecursive(defaultTmpPath, tempDir);
    // Clean up original
    fs.rmSync(defaultTmpPath, { recursive: true, force: true });
  }
  
  // Track session using the same sessionId
  activeSessions.set(sessionId, { path: tempDir, createdAt: new Date() });
  
  console.log(`[Sandbox] Clone complete: ${tempDir}`);
  return { sessionId, workspacePath: tempDir };
}

// Copy directory recursively
function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Cleanup a specific session
export function cleanupSession(sessionId: string): void {
  const session = activeSessions.get(sessionId);
  if (session && fs.existsSync(session.path)) {
    fs.rmSync(session.path, { recursive: true, force: true });
    activeSessions.delete(sessionId);
    console.log(`[Sandbox] Cleaned up session: ${sessionId}`);
  }
}

// Cleanup old sessions (older than 1 hour)
export function cleanupOldSessions(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const [sessionId, session] of activeSessions) {
    if (session.createdAt < oneHourAgo) {
      cleanupSession(sessionId);
    }
  }
}

// Get session info
export function getSessionPath(sessionId: string): string | null {
  return activeSessions.get(sessionId)?.path || null;
}
