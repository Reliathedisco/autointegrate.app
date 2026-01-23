interface CompatibilityWarning {
  type: "framework" | "incompatible" | "overlap" | "missing_dependency" | "info";
  severity: "error" | "warning" | "info";
  integration: string;
  message: string;
  details?: string;
  suggestedAction?: string;
}

interface CompatibilityWarningsProps {
  warnings: CompatibilityWarning[];
  compact?: boolean;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "⚠️",
    text: "text-red-800",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "⚡",
    text: "text-yellow-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "💡",
    text: "text-blue-800",
  },
};

export default function CompatibilityWarnings({ warnings, compact = false }: CompatibilityWarningsProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const errorCount = warnings.filter(w => w.severity === "error").length;
  const warningCount = warnings.filter(w => w.severity === "warning").length;
  const infoCount = warnings.filter(w => w.severity === "info").length;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {errorCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
            <span>⚠️</span>
            <span>{errorCount} conflict{errorCount > 1 ? "s" : ""}</span>
          </span>
        )}
        {warningCount > 0 && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
            <span>⚡</span>
            <span>{warningCount} warning{warningCount > 1 ? "s" : ""}</span>
          </span>
        )}
        {infoCount > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
            <span>💡</span>
            <span>{infoCount} suggestion{infoCount > 1 ? "s" : ""}</span>
          </span>
        )}
      </div>
    );
  }

  const groupedWarnings = {
    error: warnings.filter(w => w.severity === "error"),
    warning: warnings.filter(w => w.severity === "warning"),
    info: warnings.filter(w => w.severity === "info"),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Compatibility Check</h3>
        <div className="flex gap-2 text-xs">
          {errorCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              {errorCount} conflict{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
              {warningCount} warning{warningCount > 1 ? "s" : ""}
            </span>
          )}
          {infoCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {infoCount} tip{infoCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {(["error", "warning", "info"] as const).map(severity => {
        const items = groupedWarnings[severity];
        if (items.length === 0) return null;

        const styles = SEVERITY_STYLES[severity];

        return (
          <div key={severity} className="space-y-2">
            {items.map((warning, idx) => (
              <div
                key={`${warning.integration}-${idx}`}
                className={`${styles.bg} ${styles.border} border rounded-lg p-3`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{styles.icon}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${styles.text}`}>
                      {warning.message}
                    </div>
                    {warning.details && (
                      <div className="text-sm text-gray-600 mt-1">
                        {warning.details}
                      </div>
                    )}
                    {warning.suggestedAction && (
                      <div className="text-sm text-gray-500 mt-2 italic">
                        Suggestion: {warning.suggestedAction}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
