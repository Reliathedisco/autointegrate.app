import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createDemoSession, getDemoRepos, DemoRepo } from "../sandbox/service.js";

const router = Router();

router.get("/repos", async (req: Request, res: Response) => {
  try {
    const repos = getDemoRepos();
    
    const publicRepos = repos.map((repo: DemoRepo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      icon: repo.icon,
      suggestedIntegrations: repo.suggestedIntegrations,
    }));
    
    res.json({ ok: true, repos: publicRepos });
  } catch (err: any) {
    console.error("[Demo API] Error loading repos:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/load", async (req: Request, res: Response) => {
  try {
    const { repoId } = req.body;
    
    if (!repoId) {
      return res.status(400).json({ ok: false, error: "repoId is required" });
    }
    
    console.log(`[Demo API] Loading demo repo: ${repoId}`);
    
    const { sessionId, tree, repoName } = await createDemoSession(repoId);
    
    res.json({
      ok: true,
      sessionId,
      tree,
      repoName,
      isDemo: true,
      message: `Demo session created: ${sessionId}`,
    });
  } catch (err: any) {
    console.error("[Demo API] Load error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
