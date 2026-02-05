export const PORT = process.env.PORT || 3001;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
export const GITHUB_DEFAULT_BRANCH = "autointegrate-generated";

/** Pull request configuration (e.g. for PR #2 or all AutoIntegrate PRs) */
export const PR_DRAFT = process.env.PR_DRAFT === "true";
export const PR_LABELS = (process.env.PR_LABELS || "autointegrate")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export const SANDBOX_DIR = "sandbox/generated";
export const JOB_DATA_FILE = "server/data/jobs.json";
export const TEMPLATE_DATA_FILE = "server/data/templates.json";
export const SANDBOX_FILE = "server/data/sandbox.json";

