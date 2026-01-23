import { Router } from "express";
import stacksRouter from "./stacks.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    server: "AutoIntegrate",
    timestamp: Date.now()
  });
});

router.use("/stacks", stacksRouter);

export default router;

