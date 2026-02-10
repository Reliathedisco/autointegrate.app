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
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-claude-secondary border-t-claude-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!hasPaid && <BillingBanner />}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-claude-text">Dashboard</h1>
        <p className="text-claude-text-secondary text-sm mt-1">Overview of your projects and activity</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/sandbox?demo=true&autoload=nextjs-starter"
          className="group p-5 bg-claude-primary rounded-xl hover:bg-claude-primary-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-white">Try Demo</div>
              <div className="text-white/70 text-sm">Explore without GitHub</div>
            </div>
          </div>
        </Link>
        <Link
          to="/sandbox"
          className="group p-5 bg-claude-surface border border-claude-border rounded-xl hover:border-claude-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-claude-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-claude-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-claude-text">Open Sandbox</div>
              <div className="text-claude-text-secondary text-sm">Load your own repository</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link to="/jobs" className="p-5 bg-claude-surface border border-claude-border rounded-xl hover:border-claude-primary/30 hover:shadow-sm transition-all">
          <div className="text-2xl font-semibold text-claude-text">{stats?.jobs || 0}</div>
          <div className="text-claude-text-secondary text-sm mt-1">Jobs</div>
        </Link>
        <Link to="/templates" className="p-5 bg-claude-surface border border-claude-border rounded-xl hover:border-claude-primary/30 hover:shadow-sm transition-all">
          <div className="text-2xl font-semibold text-claude-text">{stats?.templates || 0}</div>
          <div className="text-claude-text-secondary text-sm mt-1">Templates</div>
        </Link>
        <Link to="/integrations" className="p-5 bg-claude-surface border border-claude-border rounded-xl hover:border-claude-primary/30 hover:shadow-sm transition-all">
          <div className="text-2xl font-semibold text-claude-text">{stats?.integrations || 0}</div>
          <div className="text-claude-text-secondary text-sm mt-1">Integrations</div>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="bg-claude-surface border border-claude-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-claude-border-light">
          <h2 className="font-medium text-claude-text">Recent Jobs</h2>
        </div>
        {stats?.recentJobs && stats.recentJobs.length > 0 ? (
          <div className="divide-y divide-claude-border-light">
            {stats.recentJobs.map((job: any) => (
              <div key={job.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-claude-text">{job.repo || "Unknown"}</div>
                  <div className="text-xs text-claude-text-tertiary mt-0.5">{job.integrations?.join(", ") || "No integrations"}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  job.status === "completed" ? "bg-claude-success-light text-claude-success" :
                  job.status === "failed" ? "bg-claude-danger-light text-claude-danger" :
                  "bg-claude-warning-light text-claude-warning"
                }`}>
                  {job.status || "pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="text-claude-text-tertiary text-sm">No jobs yet</div>
            <Link to="/sandbox" className="text-claude-primary text-sm hover:underline mt-1 inline-block">
              Get started in the Sandbox
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
