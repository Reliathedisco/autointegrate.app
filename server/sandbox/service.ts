// Sandbox Service - Core Logic

import path from "path";
import fs from "fs";
import os from "os";
import { cloneToTemp, cleanupSession } from "./temp.js";
import { generateFilesForIntegrations, GeneratedFile } from "../integrations/generator.js";
import { diffFolder, applyDiffs, getDiffSummary, FileDiff } from "./diff.js";
import archiver from "archiver";
import { Writable } from "stream";
import { v4 as uuidv4 } from "uuid";

export interface TreeNode {
  name: string;
  path: string;
  relativePath: string;
  type: "folder" | "file";
  children: TreeNode[];
  size?: number;
  extension?: string;
  content?: string;
}

export interface SandboxSession {
  id: string;
  workspacePath: string;
  repoUrl: string;
  tree: TreeNode[];
  appliedIntegrations: string[];
  createdAt: Date;
  isDemo: boolean;
}

export interface DemoRepo {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestedIntegrations: string[];
  mockTree: TreeNode[];
}

// Active sandbox sessions
const sessions: Map<string, SandboxSession> = new Map();

// Load repository and return file tree
export async function loadRepoTree(repoUrl: string, token?: string): Promise<{
  sessionId: string;
  tree: TreeNode[];
}> {
  const { sessionId, workspacePath } = await cloneToTemp(repoUrl, token);
  
  const tree = buildTree(workspacePath, workspacePath);
  
  // Store session - using the same sessionId from cloneToTemp for consistency
  sessions.set(sessionId, {
    id: sessionId,
    workspacePath,
    repoUrl,
    tree,
    appliedIntegrations: [],
    createdAt: new Date(),
    isDemo: false,
  });
  
  console.log(`[Sandbox] Session created: ${sessionId}`);
  
  return { sessionId, tree };
}

// Build tree structure from directory
function buildTree(dir: string, rootDir: string): TreeNode[] {
  const result: TreeNode[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and node_modules
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);
      const isDir = entry.isDirectory();
      
      const node: TreeNode = {
        name: entry.name,
        path: fullPath,
        relativePath,
        type: isDir ? "folder" : "file",
        children: isDir ? buildTree(fullPath, rootDir) : [],
      };
      
      if (!isDir) {
        try {
          const stats = fs.statSync(fullPath);
          node.size = stats.size;
          node.extension = path.extname(entry.name).slice(1);
        } catch {
          // Ignore stat errors
        }
      }
      
      result.push(node);
    }
    
    // Sort: folders first, then files, alphabetically
    result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
  } catch (err) {
    console.error(`[Sandbox] Error reading directory ${dir}:`, err);
  }
  
  return result;
}

// Apply integrations to a sandbox session
export async function applySandboxIntegrations(
  sessionId: string,
  integrations: string[]
): Promise<{
  diffs: FileDiff[];
  summary: ReturnType<typeof getDiffSummary>;
  files: GeneratedFile[];
}> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  
  console.log(`[Sandbox] Applying integrations to session ${sessionId}:`, integrations);
  
  // Generate files for selected integrations
  const files = await generateFilesForIntegrations(integrations);
  
  // Calculate diffs (don't apply yet)
  const diffs = diffFolder(
    session.workspacePath,
    files.map(f => ({ path: f.path, content: f.content }))
  );
  
  const summary = getDiffSummary(diffs);
  
  // Update session
  session.appliedIntegrations = [...new Set([...session.appliedIntegrations, ...integrations])];
  
  return { diffs, summary, files };
}

// Commit changes to the sandbox (actually write files)
export async function commitSandboxChanges(
  sessionId: string,
  files: Array<{ path: string; content: string }>
): Promise<void> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  
  applyDiffs(session.workspacePath, files);
  
  // Update tree
  session.tree = buildTree(session.workspacePath, session.workspacePath);
  
  console.log(`[Sandbox] Committed ${files.length} files to session ${sessionId}`);
}

// Read a file from sandbox
export async function readSandboxFile(sessionId: string, filePath: string): Promise<string> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  
  const fullPath = path.join(session.workspacePath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  return fs.readFileSync(fullPath, "utf8");
}

// Export sandbox as ZIP
export async function exportSandboxAsZip(sessionId: string): Promise<Buffer> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });
    
    stream.on("finish", () => {
      resolve(Buffer.concat(chunks));
    });
    
    archive.on("error", reject);
    
    archive.pipe(stream);
    archive.directory(session.workspacePath, false);
    archive.finalize();
  });
}

// Get session info
export function getSession(sessionId: string): SandboxSession | undefined {
  return sessions.get(sessionId);
}

// Delete a session
export function deleteSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  
  if (session) {
    cleanupSession(sessionId);
    sessions.delete(sessionId);
    console.log(`[Sandbox] Session deleted: ${sessionId}`);
  }
}

// Get all active sessions
export function getAllSessions(): SandboxSession[] {
  return Array.from(sessions.values());
}

// Load demo repos from JSON file
export function getDemoRepos(): DemoRepo[] {
  const demoPath = path.join(process.cwd(), "demo", "sample-repos.json");
  
  if (!fs.existsSync(demoPath)) {
    console.error("[Sandbox] Demo repos file not found:", demoPath);
    return [];
  }
  
  const content = fs.readFileSync(demoPath, "utf8");
  return JSON.parse(content) as DemoRepo[];
}

// Create a demo session from a sample repo
export async function createDemoSession(repoId: string): Promise<{
  sessionId: string;
  tree: TreeNode[];
  repoName: string;
}> {
  const repos = getDemoRepos();
  const repo = repos.find(r => r.id === repoId);
  
  if (!repo) {
    throw new Error(`Demo repo not found: ${repoId}`);
  }
  
  const sessionId = `demo-${uuidv4().slice(0, 8)}`;
  const workspacePath = path.join(os.tmpdir(), "autointegrate-demo", sessionId);
  
  // Create workspace directory
  fs.mkdirSync(workspacePath, { recursive: true });
  
  // Write mock files to disk
  writeMockTree(repo.mockTree, workspacePath);
  
  // Build tree from the workspace (to get proper paths)
  const tree = buildTree(workspacePath, workspacePath);
  
  // Store session
  sessions.set(sessionId, {
    id: sessionId,
    workspacePath,
    repoUrl: `demo://${repo.id}`,
    tree,
    appliedIntegrations: [],
    createdAt: new Date(),
    isDemo: true,
  });
  
  console.log(`[Sandbox] Demo session created: ${sessionId} (${repo.name})`);
  
  return { sessionId, tree, repoName: repo.name };
}

// Write mock tree to disk
function writeMockTree(nodes: TreeNode[], basePath: string): void {
  for (const node of nodes) {
    const fullPath = path.join(basePath, node.relativePath);
    
    if (node.type === "folder") {
      fs.mkdirSync(fullPath, { recursive: true });
      if (node.children && node.children.length > 0) {
        writeMockTree(node.children, basePath);
      }
    } else {
      // Ensure parent directory exists
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });
      
      // Write file content
      const content = node.content || "";
      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
}

// Check if session is a demo session
export function isDemoSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  return session?.isDemo ?? false;
}
