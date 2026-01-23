// Integration Registry Loader

import fs from "fs";
import path from "path";

export interface IntegrationInfo {
  name: string;
  version?: string;
  category: string;
  description: string;
  env: string[];
  hasWebhook: boolean;
  templates: string[];
}

export type IntegrationRegistry = Record<string, IntegrationInfo>;

let cached: IntegrationRegistry | null = null;

export function loadRegistry(): IntegrationRegistry {
  if (cached) return cached;

  const file = path.join(process.cwd(), "integrations", "integrations.json");

  if (!fs.existsSync(file)) {
    throw new Error("integrations.json missing in /integrations/");
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  cached = data;

  return data;
}

export function getIntegration(name: string): IntegrationInfo {
  const registry = loadRegistry();
  const integration = registry[name];
  if (!integration) throw new Error(`Unknown integration: ${name}`);
  return integration;
}

export function listIntegrations(): string[] {
  return Object.keys(loadRegistry());
}

export function listIntegrationsByCategory(category: string): string[] {
  const registry = loadRegistry();
  return Object.entries(registry)
    .filter(([_, info]) => info.category === category)
    .map(([name]) => name);
}

export function getCategories(): string[] {
  const registry = loadRegistry();
  const categories = new Set<string>();
  Object.values(registry).forEach((info) => categories.add(info.category));
  return Array.from(categories);
}

export function clearCache(): void {
  cached = null;
}
