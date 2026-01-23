import { loadRegistry } from "./registry.js";

export function requiredEnvVars(integrations: string[]): string[] {
  const registry = loadRegistry();
  const vars = new Set<string>();

  integrations.forEach((name) => {
    const info = registry[name];
    if (info?.env) {
      info.env.forEach((v: string) => vars.add(v));
    }
  });

  return Array.from(vars);
}

export function generateEnvTemplate(integrations: string[]): string {
  const registry = loadRegistry();
  const lines: string[] = ["# Auto-generated .env template", ""];

  integrations.forEach((name) => {
    const info = registry[name];
    if (info?.env && info.env.length > 0) {
      lines.push(`# ${info.name}`);
      info.env.forEach((v: string) => {
        lines.push(`${v}=`);
      });
      lines.push("");
    }
  });

  return lines.join("\n");
}

export function validateEnv(integrations: string[]): {
  valid: boolean;
  missing: string[];
} {
  const required = requiredEnvVars(integrations);
  const missing = required.filter((v) => !process.env[v]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getEnvInfo(integrations: string[]): Array<{
  integration: string;
  vars: string[];
  description: string;
}> {
  const registry = loadRegistry();
  
  return integrations.map((name) => {
    const info = registry[name];
    return {
      integration: name,
      vars: info?.env || [],
      description: info?.description || "",
    };
  });
}
