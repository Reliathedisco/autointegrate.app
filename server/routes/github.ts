import { Router } from "express";
import { getGitHubClient, createBranch, commitFiles, createPR } from "../utils/githubAPI.js";

const router = Router();

router.get("/user", async (req, res) => {
  try {
    const gh = getGitHubClient();
    const user = await gh.rest.users.getAuthenticated();
    res.json(user.data);
  } catch (err: any) {
    res.status(401).json({ error: "GitHub not configured", message: err.message });
  }
});

router.post("/branch", async (req, res) => {
  const { repo } = req.body;
  const branch = await createBranch(repo);
  res.json({ branch });
});

router.post("/commit", async (req, res) => {
  const { repo, files } = req.body;

  const commit = await commitFiles(repo, files);
  res.json({ commit });
});

router.post("/pr", async (req, res) => {
  const { repo } = req.body;

  const pr = await createPR(repo);
  res.json({ pr });
});

export default router;

