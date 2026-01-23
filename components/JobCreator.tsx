"use client";

interface JobCreatorProps {
  repoUrl: string;
  integrations: string[];
  isLoading: boolean;
  onSubmit: () => void;
}

export function JobCreator({
  repoUrl,
  integrations,
  isLoading,
  onSubmit,
}: JobCreatorProps) {
  const isDisabled = !repoUrl || integrations.length === 0 || isLoading;

  return (
    <div className="mt-6 space-y-4">
      {/* Summary */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Job Summary</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Repository</span>
            <span className={repoUrl ? "text-green-400" : "text-gray-600"}>
              {repoUrl ? "✓ Selected" : "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Integrations</span>
            <span className={integrations.length > 0 ? "text-green-400" : "text-gray-600"}>
              {integrations.length > 0 ? `${integrations.length} selected` : "None selected"}
            </span>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          isDisabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating Job...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate & Create PR
          </span>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        This will clone your repo, add the selected integrations, and open a PR automatically.
      </p>
    </div>
  );
}
