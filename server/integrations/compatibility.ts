import fs from "fs";
import path from "path";

export interface CompatibilityConfig {
  meta?: {
    version?: string;
    lastUpdated?: string;
  };
  supportedFrameworks?: string[];
  incompatibleIntegrations?: Array<{
    name: string;
    reason?: string;
    resolution?: string;
  }>;
  overlappingFeatures?: Array<{
    feature: string;
    integrations: string[];
    notes?: string;
  }>;
  requires?: {
    frameworks?: string[];
    orm?: string[];
    auth?: string[];
  };
  softDependencies?: string[];
}

export interface CompatibilityWarning {
  type: "framework" | "incompatible" | "overlap" | "missing_dependency" | "info";
  severity: "error" | "warning" | "info";
  integration: string;
  message: string;
  details?: string;
  suggestedAction?: string;
}

export interface RepoAnalysis {
  framework: string | null;
  frameworks: string[];
  existingIntegrations: string[];
  orm: string | null;
  auth: string | null;
  database: string | null;
  dependencies: string[];
}

export interface CompatibilityResult {
  warnings: CompatibilityWarning[];
  repoAnalysis: RepoAnalysis;
  compatible: boolean;
}

const compatibilityCache: Record<string, CompatibilityConfig | null> = {};

export function loadCompatibilityConfig(integrationName: string): CompatibilityConfig | null {
  if (integrationName in compatibilityCache) {
    return compatibilityCache[integrationName];
  }

  const configPath = path.join(process.cwd(), "integrations", integrationName, "compatibility.json");
  
  if (!fs.existsSync(configPath)) {
    compatibilityCache[integrationName] = null;
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(content) as CompatibilityConfig;
    compatibilityCache[integrationName] = config;
    return config;
  } catch (err) {
    console.error(`Failed to load compatibility config for ${integrationName}:`, err);
    compatibilityCache[integrationName] = null;
    return null;
  }
}

export function clearCompatibilityCache(): void {
  Object.keys(compatibilityCache).forEach(key => delete compatibilityCache[key]);
}

const FRAMEWORK_PATTERNS: Record<string, string[]> = {
  "nextjs": ["next", "@next/core"],
  "express": ["express"],
  "fastify": ["fastify"],
  "koa": ["koa"],
  "hapi": ["@hapi/hapi"],
  "nestjs": ["@nestjs/core"],
  "remix": ["@remix-run/node", "@remix-run/react"],
  "nuxt": ["nuxt"],
  "sveltekit": ["@sveltejs/kit"],
  "astro": ["astro"],
};

const ORM_PATTERNS: Record<string, string[]> = {
  "prisma": ["@prisma/client", "prisma"],
  "drizzle": ["drizzle-orm"],
  "typeorm": ["typeorm"],
  "sequelize": ["sequelize"],
  "mongoose": ["mongoose"],
  "knex": ["knex"],
};

const AUTH_PATTERNS: Record<string, string[]> = {
  "clerk": ["@clerk/nextjs", "@clerk/clerk-sdk-node"],
  "nextauth": ["next-auth"],
  "auth0": ["@auth0/nextjs-auth0", "auth0"],
  "supabase-auth": ["@supabase/auth-helpers-nextjs"],
  "firebase-auth": ["firebase-admin", "firebase"],
  "passport": ["passport"],
};

const DATABASE_PATTERNS: Record<string, string[]> = {
  "postgresql": ["pg", "@neondatabase/serverless"],
  "mysql": ["mysql2", "mysql"],
  "mongodb": ["mongodb", "mongoose"],
  "redis": ["redis", "ioredis", "@upstash/redis"],
  "supabase": ["@supabase/supabase-js"],
  "planetscale": ["@planetscale/database"],
};

const INTEGRATION_PATTERNS: Record<string, string[]> = {
  "stripe": ["stripe"],
  "clerk": ["@clerk/nextjs", "@clerk/clerk-sdk-node"],
  "supabase": ["@supabase/supabase-js"],
  "resend": ["resend"],
  "openai": ["openai"],
  "sendgrid": ["@sendgrid/mail"],
  "anthropic": ["@anthropic-ai/sdk"],
  "mongodb": ["mongodb", "mongoose"],
  "redis": ["redis", "ioredis", "@upstash/redis"],
  "aws-s3": ["@aws-sdk/client-s3"],
  "github": ["@octokit/rest", "octokit"],
};

function detectFromPatterns(
  dependencies: string[],
  patterns: Record<string, string[]>
): string[] {
  const detected: string[] = [];
  
  for (const [name, packageNames] of Object.entries(patterns)) {
    if (packageNames.some(pkg => dependencies.includes(pkg))) {
      detected.push(name);
    }
  }
  
  return detected;
}

export function analyzeRepo(repoPath?: string): RepoAnalysis {
  const basePath = repoPath || process.cwd();
  const packageJsonPath = path.join(basePath, "package.json");
  
  const result: RepoAnalysis = {
    framework: null,
    frameworks: [],
    existingIntegrations: [],
    orm: null,
    auth: null,
    database: null,
    dependencies: [],
  };

  if (!fs.existsSync(packageJsonPath)) {
    return result;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allDeps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];
    result.dependencies = allDeps;

    const detectedFrameworks = detectFromPatterns(allDeps, FRAMEWORK_PATTERNS);
    result.frameworks = detectedFrameworks;
    result.framework = detectedFrameworks[0] || null;

    const detectedOrms = detectFromPatterns(allDeps, ORM_PATTERNS);
    result.orm = detectedOrms[0] || null;

    const detectedAuths = detectFromPatterns(allDeps, AUTH_PATTERNS);
    result.auth = detectedAuths[0] || null;

    const detectedDbs = detectFromPatterns(allDeps, DATABASE_PATTERNS);
    result.database = detectedDbs[0] || null;

    result.existingIntegrations = detectFromPatterns(allDeps, INTEGRATION_PATTERNS);

  } catch (err) {
    console.error("Failed to analyze repo:", err);
  }

  return result;
}

export function checkCompatibility(
  selectedIntegrations: string[],
  repoPath?: string
): CompatibilityResult {
  const warnings: CompatibilityWarning[] = [];
  const repoAnalysis = analyzeRepo(repoPath);
  
  for (const integrationName of selectedIntegrations) {
    const config = loadCompatibilityConfig(integrationName);
    
    if (!config) {
      continue;
    }

    if (config.supportedFrameworks && config.supportedFrameworks.length > 0) {
      const hasSupported = repoAnalysis.frameworks.some(f => 
        config.supportedFrameworks!.includes(f)
      );
      
      if (repoAnalysis.frameworks.length > 0 && !hasSupported) {
        warnings.push({
          type: "framework",
          severity: "warning",
          integration: integrationName,
          message: `${integrationName} may not be fully compatible with ${repoAnalysis.framework}`,
          details: `Supported frameworks: ${config.supportedFrameworks.join(", ")}`,
          suggestedAction: "Review the integration documentation for framework-specific setup",
        });
      }
    }

    if (config.incompatibleIntegrations) {
      for (const incompatible of config.incompatibleIntegrations) {
        const isSelected = selectedIntegrations.includes(incompatible.name);
        const existsInRepo = repoAnalysis.existingIntegrations.includes(incompatible.name);
        
        if (isSelected || existsInRepo) {
          warnings.push({
            type: "incompatible",
            severity: "error",
            integration: integrationName,
            message: `${integrationName} conflicts with ${incompatible.name}`,
            details: incompatible.reason,
            suggestedAction: incompatible.resolution || `Consider using only one of these integrations`,
          });
        }
      }
    }

    if (config.overlappingFeatures) {
      for (const overlap of config.overlappingFeatures) {
        const overlappingSelected = overlap.integrations.filter(
          i => selectedIntegrations.includes(i) && i !== integrationName
        );
        const overlappingExisting = overlap.integrations.filter(
          i => repoAnalysis.existingIntegrations.includes(i) && i !== integrationName
        );
        
        const allOverlapping = [...new Set([...overlappingSelected, ...overlappingExisting])];
        
        if (allOverlapping.length > 0) {
          warnings.push({
            type: "overlap",
            severity: "warning",
            integration: integrationName,
            message: `"${overlap.feature}" feature overlaps with: ${allOverlapping.join(", ")}`,
            details: overlap.notes,
            suggestedAction: "Choose one integration for this feature to avoid redundancy",
          });
        }
      }
    }

    if (config.requires) {
      if (config.requires.frameworks && config.requires.frameworks.length > 0) {
        const hasRequired = config.requires.frameworks.some(f => 
          repoAnalysis.frameworks.includes(f)
        );
        
        if (repoAnalysis.frameworks.length > 0 && !hasRequired) {
          warnings.push({
            type: "missing_dependency",
            severity: "error",
            integration: integrationName,
            message: `${integrationName} requires: ${config.requires.frameworks.join(" or ")}`,
            details: `Detected framework: ${repoAnalysis.framework || "none"}`,
            suggestedAction: "Add a required framework before using this integration",
          });
        }
      }
    }

    if (config.softDependencies) {
      const missingDeps = config.softDependencies.filter(
        dep => !selectedIntegrations.includes(dep) && !repoAnalysis.existingIntegrations.includes(dep)
      );
      
      if (missingDeps.length > 0) {
        warnings.push({
          type: "info",
          severity: "info",
          integration: integrationName,
          message: `${integrationName} works well with: ${missingDeps.join(", ")}`,
          suggestedAction: "Consider adding these integrations for enhanced functionality",
        });
      }
    }
  }

  const hasErrors = warnings.some(w => w.severity === "error");
  
  return {
    warnings,
    repoAnalysis,
    compatible: !hasErrors,
  };
}

export function getCompatibilityInfo(integrationName: string): CompatibilityConfig | null {
  return loadCompatibilityConfig(integrationName);
}
