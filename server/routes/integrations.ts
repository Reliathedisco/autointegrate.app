import { Router } from "express";
import { listIntegrations, getIntegration, getCategories } from "../integrations/registry.js";
import { generateFilesForIntegrations, getGenerationSummary } from "../integrations/generator.js";
import { checkCompatibility, getCompatibilityInfo, type CompatibilityResult } from "../integrations/compatibility.js";
import { validateEnvVars, type EnvValidationReport } from "../integrations/env-validator.js";
import { checkIntegrationVersions, getUpgradeInfo, generateUpgradeDiff, getIntegrationVersion } from "../integrations/version-checker.js";
import { recordMultipleIntegrations } from "../metrics/service.js";

const router = Router();

// List all integrations with full details
router.get("/", (req, res) => {
  try {
    const names = listIntegrations();
    const integrations = names.map((integrationName) => {
      try {
        const info = getIntegration(integrationName);
        return { id: integrationName, ...info };
      } catch {
        return { id: integrationName, name: integrationName, category: "other", description: "", env: [], hasWebhook: false, templates: [] };
      }
    });
    res.json({ integrations });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get("/categories", (req, res) => {
  try {
    const categories = getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single integration
router.get("/:name", (req, res) => {
  try {
    const integration = getIntegration(req.params.name);
    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }
    const compatibility = getCompatibilityInfo(req.params.name);
    res.json({ ...integration, compatibility });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check compatibility for selected integrations
router.post("/compatibility", (req, res) => {
  try {
    const { selected, repoPath } = req.body;
    
    if (!selected || !Array.isArray(selected)) {
      return res.status(400).json({ error: "Invalid selection" });
    }

    const result = checkCompatibility(selected, repoPath);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Validate environment variables for selected integrations
router.post("/env/validate", (req, res) => {
  try {
    const { integrations, envValues } = req.body;
    
    if (!integrations || !Array.isArray(integrations)) {
      return res.status(400).json({ error: "integrations array is required" });
    }

    const report = validateEnvVars(integrations, envValues);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate integration files
router.post("/generate", async (req, res) => {
  try {
    const { selected, repoPath } = req.body;
    
    if (!selected || !Array.isArray(selected)) {
      return res.status(400).json({ error: "Invalid selection" });
    }

    const compatibility = checkCompatibility(selected, repoPath);
    const files = await generateFilesForIntegrations(selected);
    const summary = getGenerationSummary(selected);
    const envValidation = validateEnvVars(selected);

    recordMultipleIntegrations(selected);

    res.json({
      files,
      summary,
      compatibility,
      envValidation,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get summary of what will be generated
router.post("/summary", (req, res) => {
  try {
    const { selected, repoPath } = req.body;
    
    if (!selected || !Array.isArray(selected)) {
      return res.status(400).json({ error: "Invalid selection" });
    }

    const compatibility = checkCompatibility(selected, repoPath);
    const summary = getGenerationSummary(selected);
    res.json({ ...summary, compatibility });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check for integration version upgrades
router.post("/check-upgrades", (req, res) => {
  try {
    const { repoPath, sessionId, integrations } = req.body;
    
    if (!integrations || !Array.isArray(integrations)) {
      return res.status(400).json({ error: "integrations array is required" });
    }

    const basePath = repoPath || (sessionId ? `./sandbox/sessions/${sessionId}` : "./");
    const results = checkIntegrationVersions(basePath, integrations);
    
    res.json({ upgrades: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get upgrade preview for a specific integration
router.get("/:id/upgrade-preview", (req, res) => {
  try {
    const integrationId = req.params.id;
    const currentVersion = req.query.currentVersion as string | undefined;
    const sessionId = req.query.sessionId as string || "default";
    
    const preview = generateUpgradeDiff(sessionId, integrationId, currentVersion);
    
    if (!preview) {
      return res.status(404).json({ error: "Integration not found or no upgrade available" });
    }
    
    res.json(preview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get upgrade info for a specific integration
router.post("/:id/upgrade-info", (req, res) => {
  try {
    const integrationId = req.params.id;
    const { currentVersion } = req.body;
    
    if (!currentVersion) {
      return res.status(400).json({ error: "currentVersion is required" });
    }
    
    const info = getUpgradeInfo(integrationId, currentVersion);
    
    if (!info) {
      return res.status(404).json({ error: "Integration not found" });
    }
    
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
