"use client";

interface Job {
  id: string;
  repo: string;
  integrations: string[];
  status: string;
  prUrl?: string;
  createdAt: number;
  error?: string;
}

interface JobStatusCardProps {
  job: Job;
}

export function JobStatusCard({ job }: JobStatusCardProps) {
  const getStatusBadge = () => {
    switch (job.status) {
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            ✓ Completed
          </span>
        );
      case "error":
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
            ✗ Failed
          </span>
        );
      default:
        return null;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const parseRepoName = (url: string) => {
    const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
    return match ? `${match[1]}/${match[2]}` : url;
  };

  return (
    <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-sm text-gray-500">{job.id}</code>
            {getStatusBadge()}
          </div>

          <h3 className="font-medium text-white mb-1">{parseRepoName(job.repo)}</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {job.integrations.map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded"
              >
                {name}
              </span>
            ))}
          </div>

          {job.error && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{job.error}</p>
            </div>
          )}
        </div>

        <div className="text-right text-sm text-gray-500">
          {formatTime(job.createdAt)}
        </div>
      </div>

      {/* Progress indicator for processing jobs */}
      {job.status === "processing" && (
        <div className="mt-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <ProgressStep label="Clone" done />
            <ProgressStep label="Generate" done />
            <ProgressStep label="Commit" active />
            <ProgressStep label="PR" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressStep({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
          done
            ? "bg-green-500/20 text-green-400"
            : active
            ? "bg-blue-500/20 text-blue-400"
            : "bg-gray-700 text-gray-500"
        }`}
      >
        {done ? "✓" : active ? "..." : "○"}
      </div>
      <span className={done ? "text-green-400" : active ? "text-blue-400" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );
}
