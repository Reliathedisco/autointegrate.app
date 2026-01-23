import fs from "fs";
import path from "path";
import { getIntegration } from "./registry.js";

function loadEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (!fs.existsSync(filePath)) {
    return result;
  }
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (key) {
        result[key] = value;
      }
    }
  } catch (err) {
    console.warn(`[env-validator] Failed to read env file: ${filePath}`);
  }
  
  return result;
}

export function loadEnvFromRepo(repoPath: string): Record<string, string> {
  const envFiles = [".env", ".env.local", ".env.development", ".env.development.local"];
  const combined: Record<string, string> = {};
  
  for (const envFile of envFiles) {
    const filePath = path.join(repoPath, envFile);
    const vars = loadEnvFile(filePath);
    Object.assign(combined, vars);
  }
  
  return combined;
}

export interface EnvVarRequirement {
  description: string;
  required: boolean;
  format: string | null;
  example: string;
  setupSteps: string[];
  dashboardUrl: string | null;
}

export interface EnvRequirements {
  [integration: string]: {
    [varName: string]: EnvVarRequirement;
  };
}

export interface EnvVarValidation {
  key: string;
  status: "missing" | "invalid" | "ok";
  message?: string;
  instructions?: string[];
  dashboardUrl?: string;
  example?: string;
}

export interface IntegrationEnvValidation {
  id: string;
  name: string;
  variables: EnvVarValidation[];
}

export interface EnvValidationReport {
  integrations: IntegrationEnvValidation[];
  summary: {
    missingCount: number;
    invalidCount: number;
    validCount: number;
  };
}

let cachedRequirements: EnvRequirements | null = null;

export function loadEnvRequirements(): EnvRequirements {
  if (cachedRequirements) return cachedRequirements;

  const file = path.join(process.cwd(), "integrations", "env-requirements.json");

  if (!fs.existsSync(file)) {
    console.warn("[env-validator] env-requirements.json not found, using empty requirements");
    return {};
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    cachedRequirements = data;
    return data;
  } catch (err) {
    console.error("[env-validator] Failed to parse env-requirements.json:", err);
    return {};
  }
}

export function clearEnvRequirementsCache(): void {
  cachedRequirements = null;
}

function validateFormat(value: string, format: string | null): { valid: boolean; message?: string } {
  if (!format) {
    return { valid: true };
  }

  if (format.startsWith("regex:")) {
    const pattern = format.substring(6);
    try {
      const regex = new RegExp(pattern);
      if (regex.test(value)) {
        return { valid: true };
      } else {
        return { valid: false, message: `Value does not match expected format` };
      }
    } catch (err) {
      console.error(`[env-validator] Invalid regex pattern: ${pattern}`);
      return { valid: true };
    }
  }

  return { valid: true };
}

export function validateEnvVars(
  integrations: string[],
  envValues?: Record<string, string>
): EnvValidationReport {
  const requirements = loadEnvRequirements();
  const env = envValues || process.env;
  
  const result: EnvValidationReport = {
    integrations: [],
    summary: {
      missingCount: 0,
      invalidCount: 0,
      validCount: 0,
    },
  };

  for (const integrationId of integrations) {
    let integrationName = integrationId;
    
    try {
      const info = getIntegration(integrationId);
      integrationName = info.name;
    } catch {
    }

    const integrationReqs = requirements[integrationId];
    
    if (!integrationReqs) {
      result.integrations.push({
        id: integrationId,
        name: integrationName,
        variables: [],
      });
      continue;
    }

    const variables: EnvVarValidation[] = [];

    for (const [varKey, req] of Object.entries(integrationReqs)) {
      const value = env[varKey];
      
      if (!value || value.trim() === "") {
        if (req.required) {
          variables.push({
            key: varKey,
            status: "missing",
            message: `Required environment variable ${varKey} is not set`,
            instructions: req.setupSteps,
            dashboardUrl: req.dashboardUrl || undefined,
            example: req.example,
          });
          result.summary.missingCount++;
        } else {
          variables.push({
            key: varKey,
            status: "missing",
            message: `Optional environment variable ${varKey} is not set`,
            instructions: req.setupSteps,
            dashboardUrl: req.dashboardUrl || undefined,
            example: req.example,
          });
        }
      } else {
        const formatCheck = validateFormat(value, req.format);
        
        if (!formatCheck.valid) {
          variables.push({
            key: varKey,
            status: "invalid",
            message: formatCheck.message || `${varKey} has invalid format`,
            instructions: req.setupSteps,
            dashboardUrl: req.dashboardUrl || undefined,
            example: req.example,
          });
          result.summary.invalidCount++;
        } else {
          variables.push({
            key: varKey,
            status: "ok",
            message: `${varKey} is configured correctly`,
          });
          result.summary.validCount++;
        }
      }
    }

    result.integrations.push({
      id: integrationId,
      name: integrationName,
      variables,
    });
  }

  return result;
}

export function getEnvRequirementsForIntegration(integrationId: string): Record<string, EnvVarRequirement> | null {
  const requirements = loadEnvRequirements();
  return requirements[integrationId] || null;
}
