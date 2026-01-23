interface EnvVariable {
  key: string;
  status: "missing" | "invalid" | "ok";
  message?: string;
  instructions?: string[];
  dashboardUrl?: string;
  example?: string;
}

interface EnvValidationResult {
  integrations: {
    id: string;
    name: string;
    variables: EnvVariable[];
  }[];
  summary: {
    missingCount: number;
    invalidCount: number;
    validCount: number;
  };
}

interface EnvValidationProps {
  validation: EnvValidationResult | null;
  compact?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; icon: string; text: string; badge: string }> = {
  missing: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "🔴",
    text: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },
  invalid: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "🟡",
    text: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-700",
  },
  ok: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "✅",
    text: "text-green-800",
    badge: "bg-green-100 text-green-700",
  },
};

export default function EnvValidation({ validation, compact = false }: EnvValidationProps) {
  if (!validation) {
    return null;
  }

  const { summary, integrations } = validation;
  const totalIssues = summary.missingCount + summary.invalidCount;

  if (totalIssues === 0 && compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <span>✅</span>
          <span>Environment ready</span>
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {summary.missingCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
            <span>🔴</span>
            <span>{summary.missingCount} missing</span>
          </span>
        )}
        {summary.invalidCount > 0 && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
            <span>🟡</span>
            <span>{summary.invalidCount} invalid</span>
          </span>
        )}
        {summary.validCount > 0 && totalIssues > 0 && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <span>✅</span>
            <span>{summary.validCount} valid</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Environment Setup</h3>
        <div className="flex gap-2 text-xs">
          {summary.missingCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              {summary.missingCount} missing
            </span>
          )}
          {summary.invalidCount > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
              {summary.invalidCount} invalid
            </span>
          )}
          {summary.validCount > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              {summary.validCount} valid
            </span>
          )}
        </div>
      </div>

      {integrations.map((integration) => {
        const hasIssues = integration.variables.some(v => v.status !== "ok");
        if (!hasIssues && integration.variables.length === 0) return null;

        return (
          <div key={integration.id} className="border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
              <span className="font-medium text-sm">{integration.name}</span>
              <span className="text-xs text-gray-500">
                {integration.variables.filter(v => v.status === "ok").length}/{integration.variables.length} configured
              </span>
            </div>
            <div className="divide-y">
              {integration.variables.map((variable) => {
                const styles = STATUS_STYLES[variable.status];
                return (
                  <div
                    key={variable.key}
                    className={`px-4 py-3 ${variable.status !== "ok" ? styles.bg : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm mt-0.5">{styles.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className={`text-sm font-medium ${styles.text}`}>
                            {variable.key}
                          </code>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${styles.badge}`}>
                            {variable.status}
                          </span>
                        </div>
                        
                        {variable.message && (
                          <p className="text-sm text-gray-600 mt-1">{variable.message}</p>
                        )}
                        
                        {variable.example && variable.status !== "ok" && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Example format: </span>
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                              {variable.example}
                            </code>
                          </div>
                        )}
                        
                        {variable.instructions && variable.instructions.length > 0 && variable.status !== "ok" && (
                          <div className="mt-2 space-y-1">
                            <span className="text-xs font-medium text-gray-600">Setup steps:</span>
                            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5">
                              {variable.instructions.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {variable.dashboardUrl && variable.status !== "ok" && (
                          <a
                            href={variable.dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <span>Open dashboard</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {totalIssues > 0 && (
        <div className="text-xs text-gray-500 italic">
          Environment variables can be configured in your project's secrets or .env file.
        </div>
      )}
    </div>
  );
}

export type { EnvVariable, EnvValidationResult, EnvValidationProps };
