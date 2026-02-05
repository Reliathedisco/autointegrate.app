import { useEffect, useState } from "react";
import api from "../lib/api";
import JobCard from "../components/JobCard";
import { useAuth } from "../hooks/use-auth";
import ProRequiredModal from "../components/ProRequiredModal";

interface Integration {
  id: string;
  name: string;
  description: string;
}

export default function Jobs() {
  const { hasPaid } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function loadJobs() {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  }

  async function loadIntegrations() {
    try {
      const res = await api.get("/integrations");
      setIntegrations(res.data.integrations || []);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadJobs(), loadIntegrations()]).finally(() => setIsLoading(false));
  }, []);

  // Auto-refresh jobs when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadJobs();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefreshJobs = async () => {
    setIsRefreshing(true);
    try {
      await loadJobs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshJob = async (jobId: string) => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? res.data : j)
      );
    } catch (err) {
      console.error("Failed to refresh job:", err);
    }
  };

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateJob = async () => {
    if (!repoUrl || selectedIntegrations.length === 0) return;

    if (!hasPaid) {
      setShowProModal(true);
      return;
    }
    
    setIsCreating(true);
    try {
      await api.post("/jobs", {
        repo: repoUrl,
        integrations: selectedIntegrations
      });
      setShowModal(false);
      setRepoUrl("");
      setSelectedIntegrations([]);
      await loadJobs();
    } catch (err) {
      console.error("Failed to create job:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && (
                <span className="ml-2 inline-flex items-center">
                  <span className="animate-pulse inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-green-600">Auto-refreshing</span>
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Auto-refresh</span>
          </label>
          
          {/* Manual refresh button */}
          <button
            onClick={handleRefreshJobs}
            disabled={isRefreshing}
            className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            title="Refresh jobs and PR status"
          >
            <svg 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Job
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500 mb-4">No jobs yet. Create one to get started!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Job
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job}
                onRefresh={handleRefreshJob}
                onDelete={async (jobId) => {
                  try {
                    await api.delete(`/jobs/${jobId}`);
                    await loadJobs();
                  } catch (err) {
                    console.error("Failed to delete job:", err);
                  }
                }}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Create New Job</h2>
              <p className="text-gray-500 text-sm mt-1">
                Select a repository and integrations to generate code
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Integrations ({selectedIntegrations.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {integrations.map((integration) => (
                    <label
                      key={integration.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedIntegrations.includes(integration.id)
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIntegrations.includes(integration.id)}
                        onChange={() => toggleIntegration(integration.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-sm">{integration.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {integration.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRepoUrl("");
                  setSelectedIntegrations([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                disabled={!repoUrl || selectedIntegrations.length === 0 || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProRequiredModal
        open={showProModal}
        onClose={() => setShowProModal(false)}
        actionLabel="creating jobs"
        description="Create unlimited integration jobs, generate code, and manage runs."
      />
    </div>
  );
}

