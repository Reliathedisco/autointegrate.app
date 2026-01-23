import { Router } from "express";
import { explainError, generateEnvInstructions } from "../worker/aiEngine.js";

const router = Router();

// AI error explanation
router.post("/explain", async (req, res) => {
  const { error } = req.body;

  const result = await explainError(error);
  res.json({ result });
});

// AI env variable instructions
router.post("/env", async (req, res) => {
  const { integration } = req.body;

  const result = await generateEnvInstructions(integration);
  res.json({ result });
});

export default router;

