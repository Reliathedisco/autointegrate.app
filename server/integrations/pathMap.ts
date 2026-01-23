// Path Mapping - Determines where injected files land in target repo

export interface PathMapping {
  source: string;
  target: string;
}

export function mapTemplateToPath(integration: string, file: string): string {
  // TypeScript/JavaScript templates → src/integrations/<name>/
  if (file.endsWith(".ts") || file.endsWith(".tsx")) {
    return `src/integrations/${integration}/${file}`;
  }

  // JavaScript files
  if (file.endsWith(".js") || file.endsWith(".jsx")) {
    return `src/integrations/${integration}/${file}`;
  }

  // Markdown docs → docs/
  if (file.endsWith(".md")) {
    return `docs/integrations/${integration}/${file}`;
  }

  // JSON configs
  if (file.endsWith(".json")) {
    return `src/integrations/${integration}/${file}`;
  }

  // Prisma schema
  if (file.endsWith(".prisma")) {
    return `prisma/${file}`;
  }

  // Fallback - keep in integrations folder
  return `src/integrations/${integration}/${file}`;
}

export function mapEnvToPath(integration: string): string {
  return `env/${integration}.env`;
}

export function getApiRoutePath(integration: string, routeName: string): string {
  return `app/api/${integration}/${routeName}/route.ts`;
}

export function getLibPath(integration: string, fileName: string): string {
  return `lib/${integration}/${fileName}`;
}

// Custom path mapping based on schema.json output definitions
export function mapFromSchema(
  integration: string,
  templateName: string,
  schema: any
): string | null {
  if (!schema?.templates) return null;

  const templateKey = templateName.replace(/\.(ts|tsx|js|jsx)$/, "");
  const templateConfig = schema.templates[templateKey];

  if (templateConfig?.output) {
    return templateConfig.output;
  }

  return null;
}
