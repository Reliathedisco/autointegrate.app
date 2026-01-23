import { generateFilesForIntegrations, getGenerationSummary } from "./generator.js";
import { injectFiles, injectEnvFile, injectWebhookRoute } from "./injector.js";
import { loadRegistry } from "./registry.js";

export interface IntegrationJob {
  id: string;
  integrations: string[];
  targetDir: string;
  envVars?: Record<string, string>;
  options?: {
    includeWebhooks?: boolean;
    generateEnvFile?: boolean;
  };
}

export interface JobResult {
  success: boolean;
  filesCreated: string[];
  webhooksCreated: string[];
  envVarsRequired: string[];
  errors: string[];
}

export async function processIntegrationJob(job: IntegrationJob): Promise<JobResult> {
  const result: JobResult = {
    success: true,
    filesCreated: [],
    webhooksCreated: [],
    envVarsRequired: [],
    errors: [],
  };

  try {
    // Generate integration files
    const files = await generateFilesForIntegrations(job.integrations);
    const summary = getGenerationSummary(job.integrations);
    result.envVarsRequired = summary.envVars;

    // Inject files into target directory
    const fileResults = await injectFiles(files, job.targetDir);
    
    fileResults.forEach((r) => {
      if (r.success) {
        result.filesCreated.push(r.path);
      } else {
        result.errors.push(`Failed to create ${r.path}: ${r.error}`);
      }
    });

    // Create webhook routes if requested
    if (job.options?.includeWebhooks) {
      const registry = loadRegistry();
      
      for (const name of job.integrations) {
        const info = registry[name];
        if (info?.hasWebhook) {
          const webhookResult = await injectWebhookRoute(name, job.targetDir);
          if (webhookResult.success) {
            result.webhooksCreated.push(webhookResult.path);
          } else {
            result.errors.push(`Failed to create webhook for ${name}: ${webhookResult.error}`);
          }
        }
      }
    }

    // Generate .env file if requested
    if (job.options?.generateEnvFile) {
      const { generateEnvExample } = await import("./envBuilder.js");
      const envContent = generateEnvExample(job.integrations);
      await injectEnvFile(envContent, job.targetDir);
    }

    result.success = result.errors.length === 0;
  } catch (err: any) {
    result.success = false;
    result.errors.push(err.message);
  }

  return result;
}

export async function validateJob(job: IntegrationJob): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const registry = loadRegistry();

  // Check all integrations exist
  for (const name of job.integrations) {
    if (!registry[name]) {
      errors.push(`Unknown integration: ${name}`);
    }
  }

  // Check target directory is valid
  if (!job.targetDir) {
    errors.push("Target directory is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
