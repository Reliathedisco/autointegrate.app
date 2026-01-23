import { Router } from "express";
import { getTemplates, createTemplate, deleteTemplate } from "../utils/templateStorage.js";

const router = Router();

router.get("/", async (req, res) => {
  const templates = await getTemplates();
  res.json({ templates });
});

router.get("/:name", async (req, res) => {
  try {
    const templates = await getTemplates();
    const template = templates.find((t: any) => t.name === req.params.name);
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    res.json({ ok: true, template });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, description, files } = req.body;

  if (!name || !files) {
    return res.status(400).json({ error: "Missing name or files" });
  }

  try {
    const template = await createTemplate(name, files, description);
    res.json({ ok: true, template });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:name", async (req, res) => {
  await deleteTemplate(req.params.name);
  res.json({ ok: true });
});

export default router;

