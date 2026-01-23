import fs from "fs-extra";
import path from "path";
import { getIntegration } from "./registry.js";

interface UpgradeNotes {
  breakingChanges: string[];
  migrationNotes: string;
}

interface UpgradeNotesRegistry {
  [integrationId: string]: {
    [version: string]: UpgradeNotes;
  };
}

interface VersionCheckResult {
  integrationId: string;
  currentVersion: string | null;
  latestVersion: string;
  isOutdated: boolean;
  hasBreakingChanges: boolean;
  breakingChanges: string[];
  upgradePath: UpgradePathStep[];
}

interface UpgradePathStep {
  version: string;
  breakingChanges: string[];
  migrationNotes: string;
}

interface UpgradePreview {
  integrationId: string;
  integrationName: string;
  currentVersion: string;
  latestVersion: string;
  breakingChanges: string[];
  migrationNotes: string[];
  diffPreview: DiffItem[];
}

interface DiffItem {
  file: string;
  type: "added" | "modified" | "removed";
  changes: string[];
}

let upgradeNotesCache: UpgradeNotesRegistry | null = null;

function loadUpgradeNotes(): UpgradeNotesRegistry {
  if (upgradeNotesCache) return upgradeNotesCache;
  
  try {
    const notesPath = path.resolve(process.cwd(), "integrations/upgrade-notes.json");
    if (fs.existsSync(notesPath)) {
      upgradeNotesCache = fs.readJsonSync(notesPath);
      return upgradeNotesCache!;
    }
  } catch (err) {
    console.error("Failed to load upgrade notes:", err);
  }
  
  return {};
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

function getVersionsBetween(
  integrationId: string,
  currentVersion: string,
  latestVersion: string
): string[] {
  const upgradeNotes = loadUpgradeNotes();
  const integrationNotes = upgradeNotes[integrationId] || {};
  
  return Object.keys(integrationNotes)
    .filter((v) => compareVersions(v, currentVersion) > 0 && compareVersions(v, latestVersion) <= 0)
    .sort(compareVersions);
}

export function checkIntegrationVersions(
  repoPath: string | undefined | null,
  integrations: string[]
): VersionCheckResult[] {
  const results: VersionCheckResult[] = [];
  
  let installedVersions: Record<string, string> = {};
  
  try {
    if (repoPath) {
      const packageJsonPath = path.join(repoPath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const integrationPackageMap: Record<string, string> = {
          stripe: "stripe",
          openai: "openai",
          supabase: "@supabase/supabase-js",
          clerk: "@clerk/nextjs",
          mongodb: "mongodb",
          redis: "redis",
          anthropic: "@anthropic-ai/sdk",
          resend: "resend",
          sendgrid: "@sendgrid/mail",
        };
        
        for (const [integrationId, packageName] of Object.entries(integrationPackageMap)) {
          if (deps[packageName]) {
            installedVersions[integrationId] = deps[packageName].replace(/^[\^~]/, "");
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to read package.json:", err);
  }
  
  const upgradeNotes = loadUpgradeNotes();
  
  for (const integrationId of integrations) {
    try {
      const integration = getIntegration(integrationId);
      if (!integration || !integration.version) continue;
      
      const latestVersion = integration.version;
      const currentVersion = installedVersions[integrationId] || null;
      
      const isOutdated = currentVersion ? compareVersions(currentVersion, latestVersion) < 0 : false;
      
      const upgradePath: UpgradePathStep[] = [];
      let hasBreakingChanges = false;
      const allBreakingChanges: string[] = [];
      
      if (currentVersion && isOutdated) {
        const versionsBetween = getVersionsBetween(integrationId, currentVersion, latestVersion);
        const integrationNotes = upgradeNotes[integrationId] || {};
        
        for (const version of versionsBetween) {
          const notes = integrationNotes[version];
          if (notes) {
            upgradePath.push({
              version,
              breakingChanges: notes.breakingChanges,
              migrationNotes: notes.migrationNotes,
            });
            
            if (notes.breakingChanges.length > 0) {
              hasBreakingChanges = true;
              allBreakingChanges.push(...notes.breakingChanges);
            }
          }
        }
      }
      
      results.push({
        integrationId,
        currentVersion,
        latestVersion,
        isOutdated,
        hasBreakingChanges,
        breakingChanges: allBreakingChanges,
        upgradePath,
      });
    } catch (err) {
      console.error(`Failed to check version for ${integrationId}:`, err);
    }
  }
  
  return results;
}

export function getUpgradeInfo(
  integrationId: string,
  currentVersion: string
): {
  latestVersion: string;
  hasBreakingChanges: boolean;
  breakingChanges: string[];
  upgradePath: UpgradePathStep[];
} | null {
  try {
    const integration = getIntegration(integrationId);
    if (!integration || !integration.version) return null;
    
    const latestVersion = integration.version;
    const upgradeNotes = loadUpgradeNotes();
    const integrationNotes = upgradeNotes[integrationId] || {};
    
    const versionsBetween = getVersionsBetween(integrationId, currentVersion, latestVersion);
    const upgradePath: UpgradePathStep[] = [];
    const allBreakingChanges: string[] = [];
    
    for (const version of versionsBetween) {
      const notes = integrationNotes[version];
      if (notes) {
        upgradePath.push({
          version,
          breakingChanges: notes.breakingChanges,
          migrationNotes: notes.migrationNotes,
        });
        allBreakingChanges.push(...notes.breakingChanges);
      }
    }
    
    return {
      latestVersion,
      hasBreakingChanges: allBreakingChanges.length > 0,
      breakingChanges: allBreakingChanges,
      upgradePath,
    };
  } catch (err) {
    console.error(`Failed to get upgrade info for ${integrationId}:`, err);
    return null;
  }
}

export function generateUpgradeDiff(
  sessionId: string,
  integrationId: string,
  currentVersion?: string
): UpgradePreview | null {
  try {
    const integration = getIntegration(integrationId);
    if (!integration || !integration.version) return null;
    
    const latestVersion = integration.version;
    const fromVersion = currentVersion || "1.0.0";
    const upgradeNotes = loadUpgradeNotes();
    const integrationNotes = upgradeNotes[integrationId] || {};
    
    const versionsBetween = getVersionsBetween(integrationId, fromVersion, latestVersion);
    const allBreakingChanges: string[] = [];
    const allMigrationNotes: string[] = [];
    
    for (const version of versionsBetween) {
      const notes = integrationNotes[version];
      if (notes) {
        allBreakingChanges.push(...notes.breakingChanges);
        if (notes.migrationNotes) {
          allMigrationNotes.push(`v${version}: ${notes.migrationNotes}`);
        }
      }
    }
    
    const diffPreview: DiffItem[] = generateTemplateDiffs(integrationId, fromVersion, latestVersion);
    
    return {
      integrationId,
      integrationName: integration.name,
      currentVersion: fromVersion,
      latestVersion,
      breakingChanges: allBreakingChanges,
      migrationNotes: allMigrationNotes,
      diffPreview,
    };
  } catch (err) {
    console.error(`Failed to generate upgrade diff for ${integrationId}:`, err);
    return null;
  }
}

function generateTemplateDiffs(
  integrationId: string,
  fromVersion: string,
  toVersion: string
): DiffItem[] {
  const diffs: DiffItem[] = [];
  
  const templateChanges: Record<string, Record<string, DiffItem[]>> = {
    stripe: {
      "2.0.0": [
        {
          file: "lib/stripe/webhook.ts",
          type: "modified",
          changes: [
            "- export function handleWebhook(body: string, signature: string)",
            "+ export async function handleWebhook(body: string, signature: string)",
            "+ const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);",
          ],
        },
        {
          file: "lib/stripe/checkout.ts",
          type: "modified",
          changes: [
            "- const session = stripe.checkout.sessions.create(...)",
            "+ const session = await stripe.checkout.sessions.create(...)",
          ],
        },
      ],
    },
    openai: {
      "2.0.0": [
        {
          file: "lib/openai/chat.ts",
          type: "modified",
          changes: [
            "- const completion = await openai.createCompletion({",
            "-   model: 'text-davinci-003',",
            "-   prompt: message",
            "- });",
            "+ const completion = await openai.chat.completions.create({",
            "+   model: 'gpt-3.5-turbo',",
            "+   messages: [{ role: 'user', content: message }]",
            "+ });",
          ],
        },
      ],
    },
    supabase: {
      "2.0.0": [
        {
          file: "lib/supabase/auth.ts",
          type: "modified",
          changes: [
            "- const { data, error } = await supabase.auth.signIn({ email, password });",
            "+ const { data, error } = await supabase.auth.signInWithPassword({ email, password });",
          ],
        },
        {
          file: "lib/supabase/realtime.ts",
          type: "modified",
          changes: [
            "- supabase.from('table').on('INSERT', handler).subscribe()",
            "+ supabase.channel('table-changes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'table' }, handler).subscribe()",
          ],
        },
      ],
    },
  };
  
  const integrationChanges = templateChanges[integrationId] || {};
  
  for (const [version, changes] of Object.entries(integrationChanges)) {
    if (compareVersions(version, fromVersion) > 0 && compareVersions(version, toVersion) <= 0) {
      diffs.push(...changes);
    }
  }
  
  return diffs;
}

export function getIntegrationVersion(integrationId: string): string | null {
  try {
    const integration = getIntegration(integrationId);
    return integration?.version || null;
  } catch {
    return null;
  }
}
