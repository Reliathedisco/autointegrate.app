import fs from "fs";
import path from "path";

export interface Stack {
  id: string;
  name: string;
  description: string;
  category: string;
  integrations: string[];
  configDefaults?: Record<string, any>;
}

export type StackRegistry = Record<string, Stack>;

let cached: StackRegistry | null = null;

export function loadStackRegistry(): StackRegistry {
  if (cached) return cached;

  const stacksDir = path.join(process.cwd(), "stacks");

  if (!fs.existsSync(stacksDir)) {
    return {};
  }

  const files = fs.readdirSync(stacksDir).filter((f) => f.endsWith(".json"));
  const registry: StackRegistry = {};

  for (const file of files) {
    const filePath = path.join(stacksDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as Stack;
    registry[data.id] = data;
  }

  cached = registry;
  return registry;
}

export function getStack(id: string): Stack | null {
  const registry = loadStackRegistry();
  return registry[id] || null;
}

export function listStacks(): Stack[] {
  const registry = loadStackRegistry();
  return Object.values(registry);
}

export function clearCache(): void {
  cached = null;
}
