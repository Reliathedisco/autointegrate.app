"use client";

import { useState } from "react";

interface RepoSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

const EXAMPLE_REPOS = [
  "https://github.com/username/my-nextjs-app",
  "https://github.com/username/saas-starter",
  "https://github.com/username/react-dashboard",
];

export function RepoSelector({ value, onChange }: RepoSelectorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isValidGithubUrl = (url: string) => {
    return url.match(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/);
  };

  const parseRepoInfo = (url: string) => {
    if (!url) return null;
    const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  };

  const repoInfo = parseRepoInfo(value);
  const isValid = value === "" || isValidGithubUrl(value);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          GitHub Repository
        </label>
        <div className="relative">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              !isValid
                ? "border-red-500"
                : isFocused
                ? "border-blue-500"
                : "border-gray-700"
            }`}
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {!isValid && (
          <p className="text-red-400 text-sm mt-1">
            Please enter a valid GitHub repository URL
          </p>
        )}
      </div>

      {/* Repo Preview */}
      {repoInfo && isValid && (
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">{repoInfo.repo}</p>
              <p className="text-sm text-gray-500">{repoInfo.owner}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      {!value && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Example formats:</p>
          <div className="space-y-1">
            {EXAMPLE_REPOS.map((repo) => (
              <button
                key={repo}
                onClick={() => onChange(repo)}
                className="block w-full text-left text-sm text-gray-500 hover:text-blue-400 transition-colors truncate"
              >
                {repo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
