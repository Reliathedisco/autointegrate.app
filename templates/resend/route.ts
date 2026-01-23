import express from "express";
import { sendEmail } from "./email";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { to, subject, html } = req.body;

  await sendEmail(to, subject, html);
  res.json({ ok: true });
});

export default router;

