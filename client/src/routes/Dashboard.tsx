import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

interface Stats {
  jobs: number;
  templates: number;
  integrations: number;
  recentJobs: any[];
}

interface MetricsStats {
  integrationsThisWeek: number;
  hoursSavedThisMonth: number;
  totalIntegrations: number;
  totalHoursSaved: number;
}

// Minimalist SVG illustrations
const Illustrations = {
  Plant: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="68" rx="16" ry="4" fill="#E8E4DF" />
      <rect x="36" y="45" width="8" height="23" rx="2" fill="#D4CFC7" />
      <circle cx="40" cy="35" r="18" fill="#B8D4C8" />
      <circle cx="32" cy="28" r="8" fill="#9BC4B1" />
      <circle cx="48" cy="30" r="6" fill="#A8CFBB" />
      <circle cx="40" cy="22" r="5" fill="#8BBF9F" />
    </svg>
  ),
  Lamp: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="38" y="35" width="4" height="35" fill="#D4CFC7" />
      <ellipse cx="40" cy="70" rx="10" ry="3" fill="#E8E4DF" />
      <path d="M20 35 L40 10 L60 35 Z" fill="#F5E6D3" stroke="#E8DCC8" strokeWidth="2" />
      <ellipse cx="40" cy="35" rx="20" ry="4" fill="#EFE5D5" />
    </svg>
  ),
  Coffee: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="65" rx="18" ry="5" fill="#E8E4DF" />
      <rect x="22" y="35" width="36" height="30" rx="4" fill="#F5F0EB" stroke="#E8E4DF" strokeWidth="2" />
      <ellipse cx="40" cy="35" rx="18" ry="5" fill="#F5F0EB" stroke="#E8E4DF" strokeWidth="2" />
      <path d="M58 42 Q70 42 70 52 Q70 62 58 62" stroke="#E8E4DF" strokeWidth="3" fill="none" />
      <path d="M32 20 Q32 12 40 15 Q48 12 48 20" stroke="#D4CFC7" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="18" y="20" width="44" height="50" rx="2" fill="#F5E6D3" />
      <rect x="22" y="20" width="40" height="50" rx="2" fill="#FEFCFA" stroke="#E8DCC8" strokeWidth="2" />
      <line x1="28" y1="32" x2="52" y2="32" stroke="#E8E4DF" strokeWidth="2" />
      <line x1="28" y1="40" x2="48" y2="40" stroke="#E8E4DF" strokeWidth="2" />
      <line x1="28" y1="48" x2="45" y2="48" stroke="#E8E4DF" strokeWidth="2" />
      <circle cx="40" cy="60" r="4" fill="#B8D4C8" />
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path d="M15 28 L15 60 Q15 65 20 65 L60 65 Q65 65 65 60 L65 32 Q65 28 60 28 L40 28 L35 22 L20 22 Q15 22 15 28" fill="#F5E6D3" stroke="#E8DCC8" strokeWidth="2" />
      <rect x="25" y="40" width="30" height="3" rx="1" fill="#D4CFC7" />
      <rect x="25" y="48" width="20" height="3" rx="1" fill="#E8E4DF" />
    </svg>
  ),
  Rocket: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="68" rx="12" ry="3" fill="#E8E4DF" />
      <path d="M40 15 Q55 30 55 50 L45 65 L35 65 L25 50 Q25 30 40 15" fill="#F5F0EB" stroke="#E8E4DF" strokeWidth="2" />
      <circle cx="40" cy="35" r="6" fill="#B8D4C8" />
      <path d="M25 50 L18 58 L28 55" fill="#F5E6D3" />
      <path d="M55 50 L62 58 L52 55" fill="#F5E6D3" />
      <rect x="37" y="55" width="6" height="10" fill="#E8C8A8" />
    </svg>
  ),
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [metrics, setMetrics] = useState<MetricsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, templatesRes, integrationsRes, metricsRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/templates"),
          api.get("/integrations"),
          api.get("/metrics/public"),
        ]);

        setStats({
          jobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : 0,
          templates: templatesRes.data.templates?.length || 0,
          integrations: integrationsRes.data.integrations?.length || 0,
          recentJobs: Array.isArray(jobsRes.data) ? jobsRes.data.slice(0, 4) : [],
        });
        
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setStats({ jobs: 0, templates: 0, integrations: 0, recentJobs: [] });
        setMetrics({ integrationsThisWeek: 0, hoursSavedThisMonth: 0, totalIntegrations: 0, totalHoursSaved: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 opacity-60">
            <Illustrations.Coffee />
          </div>
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <p className="text-stone-400 text-sm mb-1">{greeting}</p>
        <h1 className="text-3xl font-light text-stone-800 tracking-tight">
          Welcome to <span className="font-medium">AutoIntegrate</span>
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          to="/jobs"
          className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 transition-all duration-300 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Jobs</p>
              <p className="text-4xl font-light text-stone-800">{stats?.jobs || 0}</p>
              <p className="text-stone-400 text-sm mt-2">Integration tasks</p>
            </div>
            <div className="w-16 h-16 opacity-70 group-hover:opacity-100 transition-opacity">
              <Illustrations.Rocket />
            </div>
          </div>
        </Link>

        <Link
          to="/templates"
          className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 transition-all duration-300 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Templates</p>
              <p className="text-4xl font-light text-stone-800">{stats?.templates || 0}</p>
              <p className="text-stone-400 text-sm mt-2">Code templates</p>
            </div>
            <div className="w-16 h-16 opacity-70 group-hover:opacity-100 transition-opacity">
              <Illustrations.Book />
            </div>
          </div>
        </Link>

        <Link
          to="/integrations"
          className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 transition-all duration-300 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Integrations</p>
              <p className="text-4xl font-light text-stone-800">{stats?.integrations || 0}</p>
              <p className="text-stone-400 text-sm mt-2">Available APIs</p>
            </div>
            <div className="w-16 h-16 opacity-70 group-hover:opacity-100 transition-opacity">
              <Illustrations.Plant />
            </div>
          </div>
        </Link>
      </div>

      {/* Usage Metrics Card */}
      {metrics && (
        <div className="mb-12">
          <h2 className="text-stone-400 text-xs uppercase tracking-wider mb-4">Usage Metrics</h2>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-stone-800">{metrics.integrationsThisWeek}</p>
                <p className="text-stone-500 text-xs mt-1">This Week</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-stone-800">{metrics.hoursSavedThisMonth}h</p>
                <p className="text-stone-500 text-xs mt-1">Saved This Month</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-stone-800">{metrics.totalIntegrations}</p>
                <p className="text-stone-500 text-xs mt-1">Total Integrations</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-stone-800">{metrics.totalHoursSaved}h</p>
                <p className="text-stone-500 text-xs mt-1">Total Hours Saved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-stone-400 text-xs uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/sandbox?demo=true&autoload=nextjs-starter"
              className="group flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-xl">🎮</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Try Demo</p>
                <p className="text-emerald-100 text-xs">Explore without GitHub</p>
              </div>
              <svg className="w-4 h-4 text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/sandbox"
              className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-stone-700 font-medium text-sm">Sandbox</p>
                <p className="text-stone-400 text-xs">Load your own repository</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/integrations"
              className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-stone-700 font-medium text-sm">Browse Integrations</p>
                <p className="text-stone-400 text-xs">Explore API templates</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/jobs"
              className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-100 hover:border-sky-200 hover:bg-sky-50/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-stone-700 font-medium text-sm">Create Job</p>
                <p className="text-stone-400 text-xs">Start new integration</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/templates"
              className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-stone-700 font-medium text-sm">Templates</p>
                <p className="text-stone-400 text-xs">View code snippets</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <h2 className="text-stone-400 text-xs uppercase tracking-wider mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {stats?.recentJobs && stats.recentJobs.length > 0 ? (
              <div className="divide-y divide-stone-50">
                {stats.recentJobs.map((job: any, index: number) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-4 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-700 text-sm font-medium truncate">
                        {job.repo || "Unknown repository"}
                      </p>
                      <p className="text-stone-400 text-xs truncate">
                        {job.integrations?.join(", ") || "No integrations"}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        job.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : job.status === "failed"
                          ? "bg-red-50 text-red-500"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {job.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 mb-4 opacity-50">
                  <Illustrations.Folder />
                </div>
                <p className="text-stone-400 text-sm text-center">No recent activity</p>
                <p className="text-stone-300 text-xs text-center mt-1">
                  Start by creating your first job
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-12 bg-white rounded-2xl border border-stone-100 p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 flex-shrink-0">
            <Illustrations.Lamp />
          </div>
          <div>
            <h2 className="text-stone-800 text-lg font-medium mb-2">Getting Started</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              AutoIntegrate helps you add API integrations to your projects in minutes. 
              Follow these simple steps to get started.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-600 text-sm font-medium">1</span>
            </div>
            <div>
              <p className="text-stone-700 text-sm font-medium mb-1">Load Repository</p>
              <p className="text-stone-400 text-xs leading-relaxed">
                Enter your GitHub repository URL in the Sandbox to get started
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-sm font-medium">2</span>
            </div>
            <div>
              <p className="text-stone-700 text-sm font-medium mb-1">Select Integrations</p>
              <p className="text-stone-400 text-xs leading-relaxed">
                Choose from 20+ API integration templates like Stripe, OpenAI, and more
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center flex-shrink-0">
              <span className="text-sky-600 text-sm font-medium">3</span>
            </div>
            <div>
              <p className="text-stone-700 text-sm font-medium mb-1">Apply & Export</p>
              <p className="text-stone-400 text-xs leading-relaxed">
                Preview the changes, then export as ZIP or create a pull request
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-stone-300 text-xs">
          Made with care • AutoIntegrate
        </p>
      </div>
    </div>
  );
}
