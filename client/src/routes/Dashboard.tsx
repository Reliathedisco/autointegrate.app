import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../hooks/use-auth";
import BillingBanner from "../components/BillingBanner";

interface Stats {
  jobs: number;
  templates: number;
  integrations: number;
  recentJobs: any[];
}

export default function Dashboard() {
  const { hasPaid } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, templatesRes, integrationsRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/templates"),
          api.get("/integrations"),
        ]);

        setStats({
          jobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : 0,
          templates: templatesRes.data.templates?.length || 0,
          integrations: integrationsRes.data.integrations?.length || 0,
          recentJobs: Array.isArray(jobsRes.data) ? jobsRes.data.slice(0, 5) : [],
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
        setStats({ jobs: 0, templates: 0, integrations: 0, recentJobs: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!hasPaid && <BillingBanner />}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/sandbox?demo=true&autoload=nextjs-starter"
          className="p-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <div className="font-medium">Try Demo</div>
          <div className="text-emerald-100 text-sm">Explore without GitHub</div>
        </Link>
        <Link
          to="/sandbox"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="font-medium text-gray-900">Open Sandbox</div>
          <div className="text-gray-500 text-sm">Load your own repository</div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link to="/jobs" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
          <div className="text-2xl font-semibold text-gray-900">{stats?.jobs || 0}</div>
          <div className="text-gray-500 text-sm">Jobs</div>
        </Link>
        <Link to="/templates" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
          <div className="text-2xl font-semibold text-gray-900">{stats?.templates || 0}</div>
          <div className="text-gray-500 text-sm">Templates</div>
        </Link>
        <Link to="/integrations" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
          <div className="text-2xl font-semibold text-gray-900">{stats?.integrations || 0}</div>
          <div className="text-gray-500 text-sm">Integrations</div>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Recent Jobs</h2>
        </div>
        {stats?.recentJobs && stats.recentJobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recentJobs.map((job: any) => (
              <div key={job.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.repo || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{job.integrations?.join(", ") || "No integrations"}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  job.status === "completed" ? "bg-green-100 text-green-700" :
                  job.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {job.status || "pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No jobs yet. Start by opening the Sandbox.
          </div>
        )}
      </div>
    </div>
  );
}
