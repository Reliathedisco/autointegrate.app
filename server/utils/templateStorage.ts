import fs from "fs-extra";
import { TEMPLATE_DATA_FILE } from "../config.js";

export async function loadTemplates() {
  await fs.ensureFile(TEMPLATE_DATA_FILE);
  return (await fs.readJson(TEMPLATE_DATA_FILE).catch(() => [])) as any[];
}

export async function getTemplates() {
  return loadTemplates();
}

export async function createTemplate(name: string, files: Record<string, string> | Array<{path: string, content: string}>, description?: string) {
  const templates = await loadTemplates();
  const existing = templates.find((t) => t.name === name);
  if (existing) throw new Error("Template exists");

  const newTemplate = { name, description, files };
  templates.push(newTemplate);

  await fs.writeJson(TEMPLATE_DATA_FILE, templates, { spaces: 2 });
  return newTemplate;
}

export async function deleteTemplate(name: string) {
  const templates = await loadTemplates();
  const filtered = templates.filter((t) => t.name !== name);

  await fs.writeJson(TEMPLATE_DATA_FILE, filtered, { spaces: 2 });
}

