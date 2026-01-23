import { Router } from "express";
import { getPublicStats, getTimeSavedConfig, recordIntegration, recordMultipleIntegrations } from "../metrics/service.js";

const router = Router();

router.get("/public", (req, res) => {
  try {
    const stats = getPublicStats();
    res.json(stats);
  } catch (err: any) {
    console.error("[Metrics API] Error getting public stats:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/config", (req, res) => {
  try {
    const config = getTimeSavedConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/record", (req, res) => {
  try {
    const { integrationId, integrationIds } = req.body;
    
    if (integrationIds && Array.isArray(integrationIds)) {
      recordMultipleIntegrations(integrationIds);
      res.json({ ok: true, recorded: integrationIds.length });
    } else if (integrationId) {
      recordIntegration(integrationId);
      res.json({ ok: true, recorded: 1 });
    } else {
      res.status(400).json({ error: "integrationId or integrationIds required" });
    }
  } catch (err: any) {
    console.error("[Metrics API] Error recording:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
