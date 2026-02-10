import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import CompatibilityWarnings from "../components/CompatibilityWarnings";
import EnvValidation, { EnvValidationResult } from "../components/EnvValidation";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  env: string[];
  hasWebhook: boolean;
  templates: string[];
  version?: string;
}

interface UpgradePathStep {
  version: string;
  breakingChanges: string[];
  migrationNotes: string;
}

interface UpgradeCheckResult {
  integrationId: string;
  currentVersion: string | null;
  latestVersion: string;
  isOutdated: boolean;
  hasBreakingChanges: boolean;
  breakingChanges: string[];
  upgradePath: UpgradePathStep[];
}

interface DiffItem {
  file: string;
  type: "added" | "modified" | "removed";
  changes: string[];
}

interface UpgradePreview {
  integrationId: string;
  integrationName: string;
  currentVersion: string;
  latestVersion: string;
  breakingChanges: string[];
  migrationNotes: string[];
  diffPreview: DiffItem[];
}

interface Stack {
  id: string;
  name: string;
  description: string;
  category: string;
  integrations: string[];
  configDefaults?: Record<string, any>;
}

interface StackPreviewFile {
  path: string;
  integration: string;
}

interface StackPreviewData {
  files: StackPreviewFile[];
  compatibility: CompatibilityResult | null;
  envValidation: EnvValidationResult | null;
}

interface CompatibilityWarning {
  type: "framework" | "incompatible" | "overlap" | "missing_dependency" | "info";
  severity: "error" | "warning" | "info";
  integration: string;
  message: string;
  details?: string;
  suggestedAction?: string;
}

interface CompatibilityResult {
  warnings: CompatibilityWarning[];
  repoAnalysis: {
    framework: string | null;
    frameworks: string[];
    existingIntegrations: string[];
    orm: string | null;
    auth: string | null;
    database: string | null;
  };
  compatible: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  auth: "lock",
  payments: "credit-card",
  database: "database",
  storage: "archive",
  email: "mail",
  ai: "cpu",
  analytics: "bar-chart",
  realtime: "zap",
  devtools: "tool",
  automation: "clock",
};

function CategoryIcon({ category, className = "w-4 h-4" }: { category: string; className?: string }) {
  const iconPaths: Record<string, string> = {
    lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    "credit-card": "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    database: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    archive: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    cpu: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    "bar-chart": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    zap: "M13 10V3L4 14h7v7l9-11h-7z",
    tool: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  const iconKey = CATEGORY_ICONS[category] || "archive";
  const path = iconPaths[iconKey] || iconPaths.archive;

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [checkingCompatibility, setCheckingCompatibility] = useState(false);
  const [previewingStack, setPreviewingStack] = useState<Stack | null>(null);
  const [stackPreviewData, setStackPreviewData] = useState<StackPreviewData | null>(null);
  const [loadingStackPreview, setLoadingStackPreview] = useState(false);
  const [upgradeChecks, setUpgradeChecks] = useState<Record<string, UpgradeCheckResult>>({});
  const [upgradePreviewModal, setUpgradePreviewModal] = useState<{
    integrationId: string;
    preview: UpgradePreview | null;
    loading: boolean;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const [integrationsRes, stacksRes] = await Promise.all([
          api.get("/integrations"),
          api.get("/stacks")
        ]);

        const data = integrationsRes.data.integrations || [];
        const validIntegrations = data.filter((i: Integration) => i && typeof i === 'object' && i.name);
        setIntegrations(validIntegrations);

        const cats = [...new Set(validIntegrations.map((i: Integration) => i.category).filter(Boolean))];
        setCategories(cats as string[]);

        setStacks(stacksRes.data.stacks || []);
      } catch (err: any) {
        console.error("Failed to load integrations:", err);
        setError(err.message || "Failed to load integrations");
      } finally {
        setLoading(false);
        setLoadingStacks(false);
      }
    }
    load();
  }, []);

  const checkCompatibility = useCallback(async (selected: string[]) => {
    if (selected.length === 0) {
      setCompatibility(null);
      return;
    }

    setCheckingCompatibility(true);
    try {
      const res = await api.post("/integrations/compatibility", { selected });
      setCompatibility(res.data);
    } catch (err) {
      console.error("Failed to check compatibility:", err);
    } finally {
      setCheckingCompatibility(false);
    }
  }, []);

  const checkForUpgrades = useCallback(async (integrationIds: string[]) => {
    if (integrationIds.length === 0) return;

    try {
      const res = await api.post("/integrations/check-upgrades", {
        integrations: integrationIds,
      });

      const upgrades = res.data.upgrades || [];
      const checksMap: Record<string, UpgradeCheckResult> = {};

      for (const upgrade of upgrades) {
        checksMap[upgrade.integrationId] = upgrade;
      }

      setUpgradeChecks(checksMap);
    } catch (err) {
      console.error("Failed to check for upgrades:", err);
    }
  }, []);

  const openUpgradePreview = useCallback(async (integrationId: string, currentVersion?: string) => {
    setUpgradePreviewModal({
      integrationId,
      preview: null,
      loading: true,
    });

    try {
      const params = new URLSearchParams();
      if (currentVersion) params.set("currentVersion", currentVersion);

      const res = await api.get(`/integrations/${integrationId}/upgrade-preview?${params}`);
      setUpgradePreviewModal({
        integrationId,
        preview: res.data,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to load upgrade preview:", err);
      setUpgradePreviewModal(null);
    }
  }, []);

  const closeUpgradePreviewModal = () => {
    setUpgradePreviewModal(null);
  };

  const applyUpgrade = async () => {
    if (!upgradePreviewModal?.preview) return;

    const { integrationId } = upgradePreviewModal;
    closeUpgradePreviewModal();
    navigate(`/sandbox?integration=${integrationId}&upgrade=true`);
  };

  useEffect(() => {
    if (integrations.length > 0) {
      const integrationIds = integrations.map(i => i.id);
      checkForUpgrades(integrationIds);
    }
  }, [integrations, checkForUpgrades]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkCompatibility(selectedIntegrations);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedIntegrations, checkCompatibility]);

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev =>
      prev.includes(id)
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const filteredIntegrations = integrations.filter((i) => {
    if (!i || !i.id || !i.name) return false;
    const nameMatch = i.name.toLowerCase().includes(search.toLowerCase());
    const descMatch = i.description?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesSearch = nameMatch || descMatch;
    const matchesCategory = !selectedCategory || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseIntegration = (id: string) => {
    navigate(`/sandbox?integration=${id}`);
  };

  const handleApplySelected = () => {
    if (selectedIntegrations.length > 0) {
      navigate(`/sandbox?integrations=${selectedIntegrations.join(",")}`);
    }
  };

  const handleUseStack = (stack: Stack) => {
    setSelectedIntegrations(prev => {
      const newSet = new Set(prev);
      stack.integrations.forEach(id => newSet.add(id));
      return Array.from(newSet);
    });
  };

  const handlePreviewStack = async (stack: Stack) => {
    setPreviewingStack(stack);
    setStackPreviewData(null);
    setLoadingStackPreview(true);

    try {
      const res = await api.post("/integrations/generate", { selected: stack.integrations });
      const files = res.data.files || [];
      const previewFiles: StackPreviewFile[] = files.map((f: any) => ({
        path: f.path,
        integration: f.integration || "core"
      }));
      setStackPreviewData({
        files: previewFiles,
        compatibility: res.data.compatibility || null,
        envValidation: res.data.envValidation || null
      });
    } catch (err) {
      console.error("Failed to load stack preview:", err);
      setStackPreviewData({ files: [], compatibility: null, envValidation: null });
    } finally {
      setLoadingStackPreview(false);
    }
  };

  const handleUseStackFromPreview = () => {
    if (previewingStack) {
      handleUseStack(previewingStack);
      setPreviewingStack(null);
      setStackPreviewData(null);
    }
  };

  const closePreviewModal = () => {
    setPreviewingStack(null);
    setStackPreviewData(null);
  };

  const isStackApplied = (stack: Stack): boolean => {
    return stack.integrations.every(id => selectedIntegrations.includes(id));
  };

  const getIntegrationName = (id: string): string => {
    if (id === "core") return "Core Files";
    const integration = integrations.find(i => i.id === id);
    return integration?.name || id.charAt(0).toUpperCase() + id.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-claude-secondary border-t-claude-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-claude-danger mb-4">Failed to load integrations</div>
        <div className="text-claude-text-tertiary text-sm mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-claude-primary text-white rounded-lg hover:bg-claude-primary-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg className="w-12 h-12 text-claude-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
        <div className="text-claude-text-secondary">No integrations available</div>
        <div className="text-claude-text-tertiary text-sm mt-1">Check that the integrations folder is configured correctly</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-claude-text">Integrations</h1>
          <p className="text-claude-text-secondary text-sm mt-1">
            Browse and add integrations to your projects
          </p>
        </div>
        <button
          onClick={() => navigate("/sandbox")}
          className="px-4 py-2 bg-claude-primary text-white rounded-lg hover:bg-claude-primary-hover transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Open Sandbox
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 text-claude-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-claude-surface border border-claude-border rounded-lg text-sm text-claude-text placeholder-claude-text-tertiary focus:outline-none focus:ring-2 focus:ring-claude-primary/30 focus:border-claude-primary/50 transition-colors"
          />
        </div>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2.5 bg-claude-surface border border-claude-border rounded-lg text-sm text-claude-text focus:outline-none focus:ring-2 focus:ring-claude-primary/30 focus:border-claude-primary/50 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !selectedCategory
              ? "bg-claude-primary text-white"
              : "bg-claude-surface border border-claude-border text-claude-text-secondary hover:border-claude-primary/30"
          }`}
        >
          All ({integrations.length})
        </button>
        {categories.map((cat) => {
          const count = integrations.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                selectedCategory === cat
                  ? "bg-claude-primary text-white"
                  : "bg-claude-surface border border-claude-border text-claude-text-secondary hover:border-claude-primary/30"
              }`}
            >
              <CategoryIcon category={cat} className="w-3.5 h-3.5" />
              <span className="capitalize">{cat}</span>
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Quick Start Stacks */}
      {stacks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-claude-text">Quick Start Stacks</h2>
            <span className="text-xs text-claude-text-tertiary">Pre-configured bundles</span>
          </div>
          {loadingStacks ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-claude-secondary border-t-claude-primary"></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {stacks.map((stack) => {
                const applied = isStackApplied(stack);
                return (
                  <div
                    key={stack.id}
                    className={`rounded-xl p-4 border transition-all ${
                      applied
                        ? "bg-claude-primary-light border-claude-primary/30"
                        : "bg-claude-surface border-claude-border hover:border-claude-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${applied ? "bg-claude-primary/20 text-claude-primary" : "bg-claude-secondary text-claude-accent"}`}>
                          <CategoryIcon category={stack.category} className="w-4 h-4" />
                        </div>
                        <h3 className="font-medium text-claude-text text-sm">{stack.name}</h3>
                      </div>
                      {applied && (
                        <span className="text-[10px] bg-claude-primary text-white px-1.5 py-0.5 rounded font-medium">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-claude-text-secondary mb-3 line-clamp-2">{stack.description}</p>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {stack.integrations.map((id) => {
                          const isSelected = selectedIntegrations.includes(id);
                          return (
                            <span
                              key={id}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-claude-primary-light text-claude-primary-hover"
                                  : "bg-claude-bg text-claude-text-secondary"
                              }`}
                            >
                              {getIntegrationName(id)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreviewStack(stack)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-claude-border text-claude-text-secondary hover:bg-claude-bg transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleUseStack(stack)}
                        disabled={applied}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          applied
                            ? "bg-claude-primary-light text-claude-primary/50 cursor-default"
                            : "bg-claude-primary text-white hover:bg-claude-primary-hover"
                        }`}
                      >
                        {applied ? "Applied" : "Use Stack"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Integration Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 pb-24">
        {filteredIntegrations.map((integration) => {
          const isSelected = selectedIntegrations.includes(integration.id);
          return (
            <div
              key={integration.id}
              className={`bg-claude-surface rounded-xl p-4 cursor-pointer border transition-all hover:shadow-sm ${
                isSelected ? "border-claude-primary/50 ring-1 ring-claude-primary/20" : "border-claude-border hover:border-claude-primary/30"
              }`}
              onClick={() => toggleIntegration(integration.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleIntegration(integration.id)}
                    className="mt-1 h-4 w-4 rounded border-claude-border text-claude-primary focus:ring-claude-primary/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-claude-text">{integration.name}</h3>
                      {integration.version && (
                        <span className="text-[10px] text-claude-text-tertiary bg-claude-bg px-1.5 py-0.5 rounded">v{integration.version}</span>
                      )}
                    </div>
                    <span className="text-xs text-claude-text-tertiary capitalize flex items-center gap-1 mt-0.5">
                      <CategoryIcon category={integration.category} className="w-3 h-3" />
                      {integration.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {upgradeChecks[integration.id]?.isOutdated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpgradePreview(
                          integration.id,
                          upgradeChecks[integration.id]?.currentVersion || undefined
                        );
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                        upgradeChecks[integration.id]?.hasBreakingChanges
                          ? "bg-claude-warning-light text-claude-warning"
                          : "bg-claude-primary-light text-claude-primary"
                      }`}
                    >
                      Update
                    </button>
                  )}
                  {integration.hasWebhook && (
                    <span className="text-[10px] bg-claude-primary-light text-claude-primary px-2 py-0.5 rounded-full font-medium">
                      Webhook
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-claude-text-secondary mb-3 ml-6 line-clamp-2">
                {integration.description}
              </p>

              {/* Env vars */}
              {integration.env && integration.env.length > 0 && (
                <div className="mb-3 ml-6">
                  <div className="flex flex-wrap gap-1">
                    {integration.env.map((env) => (
                      <code
                        key={env}
                        className="text-[10px] bg-claude-bg text-claude-text-secondary px-1.5 py-0.5 rounded font-mono"
                      >
                        {env}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates */}
              {integration.templates && integration.templates.length > 0 && (
                <div className="mb-3 ml-6">
                  <div className="flex flex-wrap gap-1">
                    {integration.templates.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-claude-primary-light text-claude-primary-hover px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseIntegration(integration.id);
                }}
                className="w-full mt-1 py-2 bg-claude-bg text-claude-primary rounded-lg hover:bg-claude-primary-light text-xs font-medium transition-colors ml-0"
              >
                Use Integration
              </button>
            </div>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-claude-text-tertiary text-sm">
          No integrations found matching your criteria.
        </div>
      )}

      {/* Selection Action Bar */}
      {selectedIntegrations.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-claude-surface border-t border-claude-border shadow-lg p-4 z-30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-1">
                  <span className="font-medium text-claude-text text-sm">
                    {selectedIntegrations.length} integration{selectedIntegrations.length > 1 ? "s" : ""} selected
                  </span>
                  {checkingCompatibility && (
                    <span className="text-xs text-claude-text-tertiary animate-pulse">Checking compatibility...</span>
                  )}
                  {!checkingCompatibility && compatibility && (
                    <CompatibilityWarnings warnings={compatibility.warnings} compact />
                  )}
                </div>
                {!checkingCompatibility && compatibility && compatibility.warnings.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-claude-text-secondary hover:text-claude-text text-xs">
                      View compatibility details
                    </summary>
                    <div className="mt-2 max-h-48 overflow-y-auto">
                      <CompatibilityWarnings warnings={compatibility.warnings} />
                    </div>
                  </details>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIntegrations([])}
                  className="px-4 py-2 text-claude-text-secondary hover:bg-claude-bg rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplySelected}
                  className="px-5 py-2 bg-claude-primary text-white rounded-lg hover:bg-claude-primary-hover font-medium text-sm transition-colors"
                >
                  Apply Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stack Preview Modal */}
      {previewingStack && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col border border-claude-border">
            <div className="p-5 border-b border-claude-border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-claude-secondary flex items-center justify-center text-claude-accent">
                    <CategoryIcon category={previewingStack.category} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-claude-text">{previewingStack.name}</h2>
                    <p className="text-claude-text-secondary text-xs">{previewingStack.description}</p>
                  </div>
                </div>
                <button
                  onClick={closePreviewModal}
                  className="text-claude-text-tertiary hover:text-claude-text text-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-5">
                <h3 className="font-medium text-claude-text text-sm mb-2">Included Integrations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {previewingStack.integrations.map((id) => (
                    <span
                      key={id}
                      className="px-2.5 py-1 bg-claude-primary-light text-claude-primary-hover rounded-lg text-xs font-medium"
                    >
                      {getIntegrationName(id)}
                    </span>
                  ))}
                </div>
              </div>

              {stackPreviewData?.compatibility && stackPreviewData.compatibility.warnings.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-medium text-claude-text text-sm mb-2">Compatibility</h3>
                  <CompatibilityWarnings warnings={stackPreviewData.compatibility.warnings} />
                </div>
              )}

              {stackPreviewData?.envValidation && (
                <div className="mb-5">
                  <EnvValidation validation={stackPreviewData.envValidation} />
                </div>
              )}

              <div>
                <h3 className="font-medium text-claude-text text-sm mb-2">Generated Files</h3>
                {loadingStackPreview ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-claude-secondary border-t-claude-primary"></div>
                ) : stackPreviewData && stackPreviewData.files.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      stackPreviewData.files.reduce((acc, file) => {
                        if (!acc[file.integration]) acc[file.integration] = [];
                        acc[file.integration].push(file.path);
                        return acc;
                      }, {} as Record<string, string[]>)
                    ).map(([integration, paths]) => (
                      <div key={integration}>
                        <p className="text-xs font-medium text-claude-text-secondary mb-1">
                          {getIntegrationName(integration)}
                        </p>
                        <div className="bg-claude-bg rounded-lg p-2.5 space-y-0.5">
                          {paths.map((path) => (
                            <div key={path} className="flex items-center gap-1.5 text-xs">
                              <svg className="w-3 h-3 text-claude-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <code className="text-claude-text-secondary font-mono">{path}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-claude-text-tertiary text-xs py-3">No files to generate</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-claude-border-light bg-claude-bg flex justify-end gap-2">
              <button
                onClick={closePreviewModal}
                className="px-4 py-2 text-claude-text-secondary hover:bg-claude-secondary rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleUseStackFromPreview}
                disabled={isStackApplied(previewingStack)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isStackApplied(previewingStack)
                    ? "bg-claude-primary-light text-claude-primary/50 cursor-default"
                    : "bg-claude-primary text-white hover:bg-claude-primary-hover"
                }`}
              >
                {isStackApplied(previewingStack) ? "Stack Applied" : "Use Stack"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Preview Modal */}
      {upgradePreviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col border border-claude-border">
            <div className="p-5 border-b border-claude-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-claude-text">Upgrade Available</h2>
                  {upgradePreviewModal.preview && (
                    <p className="text-claude-text-secondary text-xs mt-0.5">
                      {upgradePreviewModal.preview.integrationName}: v{upgradePreviewModal.preview.currentVersion} → v{upgradePreviewModal.preview.latestVersion}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeUpgradePreviewModal}
                  className="text-claude-text-tertiary hover:text-claude-text transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {upgradePreviewModal.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-claude-secondary border-t-claude-primary"></div>
                </div>
              ) : upgradePreviewModal.preview ? (
                <>
                  {upgradePreviewModal.preview.breakingChanges.length > 0 && (
                    <div className="mb-5">
                      <h3 className="font-medium text-sm mb-2 text-claude-warning">Breaking Changes</h3>
                      <div className="bg-claude-warning-light border border-claude-warning/20 rounded-lg p-3">
                        <ul className="space-y-1.5">
                          {upgradePreviewModal.preview.breakingChanges.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-claude-text">
                              <span className="text-claude-warning mt-0.5 text-xs">&#9679;</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {upgradePreviewModal.preview.migrationNotes.length > 0 && (
                    <div className="mb-5">
                      <h3 className="font-medium text-sm mb-2 text-claude-text">Migration Notes</h3>
                      <div className="bg-claude-primary-light border border-claude-primary/10 rounded-lg p-3">
                        <ul className="space-y-1.5">
                          {upgradePreviewModal.preview.migrationNotes.map((note, idx) => (
                            <li key={idx} className="text-sm text-claude-text-secondary">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {upgradePreviewModal.preview.diffPreview.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-claude-text">Code Changes</h3>
                      <div className="space-y-3">
                        {upgradePreviewModal.preview.diffPreview.map((diff, idx) => (
                          <div key={idx} className="bg-claude-bg rounded-lg overflow-hidden border border-claude-border">
                            <div className="px-3 py-2 bg-claude-secondary/50 border-b border-claude-border flex items-center gap-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                diff.type === "added"
                                  ? "bg-claude-success-light text-claude-success"
                                  : diff.type === "modified"
                                  ? "bg-claude-warning-light text-claude-warning"
                                  : "bg-claude-danger-light text-claude-danger"
                              }`}>
                                {diff.type}
                              </span>
                              <code className="text-xs text-claude-text-secondary">{diff.file}</code>
                            </div>
                            <div className="p-3 font-mono text-xs overflow-x-auto">
                              {diff.changes.map((line, lineIdx) => (
                                <div
                                  key={lineIdx}
                                  className={`py-0.5 px-1 ${
                                    line.startsWith("+")
                                      ? "bg-claude-success-light text-claude-success"
                                      : line.startsWith("-")
                                      ? "bg-claude-danger-light text-claude-danger"
                                      : "text-claude-text-secondary"
                                  }`}
                                >
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upgradePreviewModal.preview.diffPreview.length === 0 && (
                    <div className="text-center py-8 text-claude-text-tertiary text-sm">
                      <p>No code changes required for this upgrade.</p>
                      <p className="mt-1">You can safely apply this upgrade.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-claude-text-tertiary text-sm">
                  Failed to load upgrade details.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-claude-border-light bg-claude-bg flex justify-end gap-2">
              <button
                onClick={closeUpgradePreviewModal}
                className="px-4 py-2 text-claude-text-secondary hover:bg-claude-secondary rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyUpgrade}
                disabled={upgradePreviewModal.loading || !upgradePreviewModal.preview}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  upgradePreviewModal.loading || !upgradePreviewModal.preview
                    ? "bg-claude-primary-light text-claude-primary/50 cursor-default"
                    : "bg-claude-primary text-white hover:bg-claude-primary-hover"
                }`}
              >
                Apply Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
