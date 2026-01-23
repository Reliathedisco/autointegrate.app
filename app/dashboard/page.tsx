"use client";

import { useState, useEffect } from "react";
import { IntegrationPicker } from "@/components/IntegrationPicker";
import { RepoSelector } from "@/components/RepoSelector";
import { JobCreator } from "@/components/JobCreator";
import { JobStatusCard } from "@/components/JobStatusCard";
import { PullRequestCard } from "@/components/PullRequestCard";

interface Job {
  id: string;
  repo: string;
  integrations: string[];
  status: string;
  prUrl?: string;
  createdAt: number;
  error?: string;
}

export default function DashboardPage() {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "jobs">("create");

  // Fetch jobs on mount and poll for updates
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.ok) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const handleCreateJob = async () => {
    if (!repoUrl || selectedIntegrations.length === 0) {
      alert("Please select a repository and at least one integration");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoUrl,
          integrations: selectedIntegrations,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        alert(`Job created: ${data.jobId}`);
        setSelectedIntegrations([]);
        setRepoUrl("");
        setActiveTab("jobs");
        fetchJobs();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to create job");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "error");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">A</span>
            </div>
            <h1 className="text-xl font-semibold">AutoIntegrate</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "create"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Create Job
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "jobs"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Jobs ({jobs.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "create" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Repo Selector */}
            <div className="lg:col-span-1">
              <RepoSelector value={repoUrl} onChange={setRepoUrl} />

              {/* Selected Summary */}
              {selectedIntegrations.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Selected ({selectedIntegrations.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntegrations.map((name) => (
                      <span
                        key={name}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Button */}
              <JobCreator
                repoUrl={repoUrl}
                integrations={selectedIntegrations}
                isLoading={isLoading}
                onSubmit={handleCreateJob}
              />
            </div>

            {/* Right Panel - Integration Picker */}
            <div className="lg:col-span-2">
              <IntegrationPicker
                selected={selectedIntegrations}
                onSelect={setSelectedIntegrations}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Jobs" value={jobs.length} color="blue" />
              <StatCard label="In Progress" value={pendingJobs.length} color="yellow" />
              <StatCard label="Completed" value={completedJobs.length} color="green" />
              <StatCard label="Failed" value={failedJobs.length} color="red" />
            </div>

            {/* Active Jobs */}
            {pendingJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  In Progress
                </h2>
                <div className="grid gap-4">
                  {pendingJobs.map((job) => (
                    <JobStatusCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Completed</h2>
                <div className="grid gap-4">
                  {completedJobs.map((job) => (
                    <PullRequestCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            )}

            {/* Failed Jobs */}
            {failedJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 text-red-400">Failed</h2>
                <div className="grid gap-4">
                  {failedJobs.map((job) => (
                    <JobStatusCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {jobs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No jobs yet</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create your first job
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "yellow" | "green" | "red";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
