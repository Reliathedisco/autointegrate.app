import { Router } from "express";
import { listStacks, getStack } from "../stacks/loader.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const stacks = listStacks();
    res.json({ stacks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const stack = getStack(req.params.id);
    if (!stack) {
      return res.status(404).json({ error: "Stack not found" });
    }
    res.json(stack);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
