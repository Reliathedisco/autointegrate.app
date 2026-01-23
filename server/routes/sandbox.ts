// Sandbox Routes - Full API

import { Router, Request, Response } from "express";
import crypto from "crypto";
import { listSandboxFiles, readSandboxFile as readLegacyFile } from "../utils/sandbox.js";
import {
  loadRepoTree,
  applySandboxIntegrations,
  commitSandboxChanges,
  readSandboxFile,
  exportSandboxAsZip,
  getSession,
  deleteSession,
  getAllSessions,
  isDemoSession,
} from "../sandbox/service.js";
import { validateEnvVars, loadEnvFromRepo } from "../integrations/env-validator.js";
import { explainCode } from "../worker/aiEngine.js";
import { recordMultipleIntegrations } from "../metrics/service.js";

const router = Router();

const explanationCache: Map<string, string> = new Map();

function hashContent(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

// =====================================================
// LEGACY ENDPOINTS (for static sandbox)
// =====================================================

// List files in sandbox/generated
router.get("/", async (req: Request, res: Response) => {
  try {
    const files = await listSandboxFiles();
    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Read a file from sandbox/generated
router.get("/file", async (req: Request, res: Response) => {
  try {
    const file = req.query.file as string;
    const contents = await readLegacyFile(file);
    res.json({ contents });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =====================================================
// NEW SESSION-BASED SANDBOX ENDPOINTS
// =====================================================

// Load a repository into sandbox
router.post("/load", async (req: Request, res: Response) => {
  try {
    const { repoUrl, token } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ ok: false, error: "repoUrl is required" });
    }
    
    console.log(`[Sandbox API] Loading repo: ${repoUrl}`);
    
    const { sessionId, tree } = await loadRepoTree(repoUrl, token);
    
    res.json({ 
      ok: true, 
      sessionId, 
      tree,
      message: `Repository loaded into sandbox session: ${sessionId}` 
    });
  } catch (err: any) {
    console.error("[Sandbox API] Load error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Apply integrations to sandbox (preview diffs)
router.post("/apply", async (req: Request, res: Response) => {
  try {
    const { sessionId, integrations } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }
    
    if (!integrations || !Array.isArray(integrations) || integrations.length === 0) {
      return res.status(400).json({ ok: false, error: "integrations array is required" });
    }
    
    console.log(`[Sandbox API] Applying integrations to ${sessionId}:`, integrations);
    
    const { diffs, summary, files } = await applySandboxIntegrations(sessionId, integrations);
    
    const session = getSession(sessionId);
    const repoEnvVars = session ? loadEnvFromRepo(session.workspacePath) : {};
    const envValidation = validateEnvVars(integrations, repoEnvVars);
    
    recordMultipleIntegrations(integrations);
    
    res.json({ 
      ok: true, 
      diffs, 
      summary,
      files: files.map(f => ({ path: f.path, integration: f.integration, type: f.type })),
      envValidation,
      message: `Generated ${summary.totalFiles} files (${summary.newFiles} new, ${summary.modifiedFiles} modified)` 
    });
  } catch (err: any) {
    console.error("[Sandbox API] Apply error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Commit changes to sandbox (actually write files)
router.post("/commit", async (req: Request, res: Response) => {
  try {
    const { sessionId, files } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }
    
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ ok: false, error: "files array is required" });
    }
    
    // Block commits for demo sessions
    if (isDemoSession(sessionId)) {
      return res.status(403).json({ 
        ok: false, 
        error: "Demo mode: Commits are disabled. Export as ZIP to save your changes, or load your own repository to commit.",
        isDemo: true
      });
    }
    
    await commitSandboxChanges(sessionId, files);
    
    const session = getSession(sessionId);
    
    res.json({ 
      ok: true, 
      tree: session?.tree,
      message: `Committed ${files.length} files to sandbox` 
    });
  } catch (err: any) {
    console.error("[Sandbox API] Commit error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Read a file from session
router.get("/session/:sessionId/file", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ ok: false, error: "path query param is required" });
    }
    
    const content = await readSandboxFile(sessionId, filePath);
    
    res.json({ ok: true, content, path: filePath });
  } catch (err: any) {
    console.error("[Sandbox API] Read file error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get session info
router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }
    
    res.json({ 
      ok: true, 
      session: {
        id: session.id,
        repoUrl: session.repoUrl,
        tree: session.tree,
        appliedIntegrations: session.appliedIntegrations,
        createdAt: session.createdAt,
        isDemo: session.isDemo,
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Export sandbox as ZIP
router.get("/session/:sessionId/export", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const zip = await exportSandboxAsZip(sessionId);
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=autointegrate-${sessionId}.zip`);
    res.send(zip);
  } catch (err: any) {
    console.error("[Sandbox API] Export error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete session
router.delete("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    deleteSession(sessionId);
    res.json({ ok: true, message: `Session ${sessionId} deleted` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List all sessions
router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const sessions = getAllSessions();
    res.json({ 
      ok: true, 
      sessions: sessions.map(s => ({
        id: s.id,
        repoUrl: s.repoUrl,
        appliedIntegrations: s.appliedIntegrations,
        createdAt: s.createdAt,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Explain code in a file
router.post("/explain", async (req: Request, res: Response) => {
  try {
    const { sessionId, filePath, integrationName } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }
    
    if (!filePath) {
      return res.status(400).json({ ok: false, error: "filePath is required" });
    }
    
    const content = await readSandboxFile(sessionId, filePath);
    const contentHash = hashContent(content);
    const cacheKey = `${sessionId}:${filePath}:${contentHash}`;
    
    if (explanationCache.has(cacheKey)) {
      console.log(`[Sandbox API] Returning cached explanation for ${filePath}`);
      return res.json({ 
        ok: true, 
        explanation: explanationCache.get(cacheKey),
        cached: true 
      });
    }
    
    console.log(`[Sandbox API] Generating explanation for ${filePath}`);
    const fileName = filePath.split("/").pop() || filePath;
    const explanation = await explainCode(content, fileName, integrationName || "");
    
    if (explanation) {
      explanationCache.set(cacheKey, explanation);
    }
    
    res.json({ 
      ok: true, 
      explanation,
      cached: false 
    });
  } catch (err: any) {
    console.error("[Sandbox API] Explain error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
