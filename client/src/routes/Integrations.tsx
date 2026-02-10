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
  auth: "🔐",
  payments: "💳",
  database: "🗃️",
  storage: "📦",
  email: "📧",
  ai: "🤖",
  analytics: "📊",
  realtime: "⚡",
  devtools: "🔧",
  automation: "⏰",
};

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
        
        console.log("[Integrations] API response:", integrationsRes.data);
        const data = integrationsRes.data.integrations || [];
        
        const validIntegrations = data.filter((i: Integration) => i && typeof i === 'object' && i.name);
        setIntegrations(validIntegrations);

        const cats = [...new Set(validIntegrations.map((i: Integration) => i.category).filter(Boolean))];
        setCategories(cats as string[]);

        console.log("[Stacks] API response:", stacksRes.data);
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
      console.log("[Integrations] Compatibility check:", res.data);
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
        <div className="animate-pulse text-gray-500">Loading integrations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Failed to load integrations</div>
        <div className="text-gray-500 text-sm mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <div className="text-gray-600 text-lg">No integrations available</div>
        <div className="text-gray-400 text-sm mt-2">Check that the integrations folder is configured correctly</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🔌 Integrations</h1>
          <p className="text-gray-600 mt-1">
            Browse and add integrations to your projects
          </p>
        </div>

        <button
          onClick={() => navigate("/sandbox")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <span>🧪</span>
          Open Sandbox
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_ICONS[cat] || "📦"} {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
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
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span>{CATEGORY_ICONS[cat] || "📦"}</span>
              <span className="capitalize">{cat}</span>
              <span className="text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Quick Start Stacks Section */}
      {stacks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">🚀 Quick Start Stacks</h2>
            <span className="text-sm text-gray-500">Pre-configured integration bundles</span>
          </div>
          {loadingStacks ? (
            <div className="animate-pulse text-gray-500">Loading stacks...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stacks.map((stack) => {
                const applied = isStackApplied(stack);
                return (
                  <div
                    key={stack.id}
                    className={`rounded-lg p-4 border-2 transition-all ${
                      applied
                        ? "bg-purple-50 border-purple-400"
                        : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[stack.category] || "📦"}</span>
                        <h3 className="font-semibold text-lg">{stack.name}</h3>
                      </div>
                      {applied && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{stack.description}</p>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {stack.integrations.map((id) => {
                          const isSelected = selectedIntegrations.includes(id);
                          return (
                            <span
                              key={id}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-purple-200 text-purple-800"
                                  : "bg-gray-100 text-gray-700"
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
                        className="flex-1 py-2 rounded text-sm font-medium border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleUseStack(stack)}
                        disabled={applied}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                          applied
                            ? "bg-purple-100 text-purple-400 cursor-default"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        {applied ? "✓ Applied" : "Use Stack"}
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        {filteredIntegrations.map((integration) => {
          const isSelected = selectedIntegrations.includes(integration.id);
          return (
            <div
              key={integration.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer border-2 ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-transparent"
              }`}
              onClick={() => toggleIntegration(integration.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleIntegration(integration.id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                      {integration.version && (
                        <span className="text-xs text-gray-400">v{integration.version}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      {CATEGORY_ICONS[integration.category] || "📦"}{" "}
                      {integration.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {upgradeChecks[integration.id]?.isOutdated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpgradePreview(
                          integration.id,
                          upgradeChecks[integration.id]?.currentVersion || undefined
                        );
                      }}
                      className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                        upgradeChecks[integration.id]?.hasBreakingChanges
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title={upgradeChecks[integration.id]?.hasBreakingChanges 
                        ? "Upgrade available with breaking changes" 
                        : "Upgrade available"}
                    >
                      <span>⬆</span>
                      {upgradeChecks[integration.id]?.hasBreakingChanges && <span>⚠</span>}
                      Upgrade
                    </button>
                  )}
                  {integration.hasWebhook && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Webhook
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 ml-6">
                {integration.description}
              </p>

              {/* Env vars */}
              {integration.env && integration.env.length > 0 && (
                <div className="mb-3 ml-6">
                  <p className="text-xs text-gray-500 mb-1">Required env vars:</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.env.map((env) => (
                      <code
                        key={env}
                        className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
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
                  <p className="text-xs text-gray-500 mb-1">Templates:</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.templates.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
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
                className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
              >
                Use Integration →
              </button>
            </div>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No integrations found matching your criteria.
        </div>
      )}

      {/* Selection Action Bar */}
      {selectedIntegrations.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-medium">
                    {selectedIntegrations.length} integration{selectedIntegrations.length > 1 ? "s" : ""} selected
                  </span>
                  {checkingCompatibility && (
                    <span className="text-sm text-gray-500 animate-pulse">Checking compatibility...</span>
                  )}
                  {!checkingCompatibility && compatibility && (
                    <CompatibilityWarnings warnings={compatibility.warnings} compact />
                  )}
                </div>
                {!checkingCompatibility && compatibility && compatibility.warnings.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
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
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplySelected}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Apply Selected →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewingStack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[previewingStack.category] || "📦"}</span>
                  <div>
                    <h2 className="text-xl font-bold">{previewingStack.name}</h2>
                    <p className="text-gray-600 text-sm">{previewingStack.description}</p>
                  </div>
                </div>
                <button
                  onClick={closePreviewModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Included Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {previewingStack.integrations.map((id) => (
                    <span
                      key={id}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {getIntegrationName(id)}
                    </span>
                  ))}
                </div>
              </div>
              
              {stackPreviewData?.compatibility && stackPreviewData.compatibility.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Compatibility Warnings</h3>
                  <CompatibilityWarnings warnings={stackPreviewData.compatibility.warnings} />
                </div>
              )}

              {stackPreviewData?.envValidation && (
                <div className="mb-6">
                  <EnvValidation validation={stackPreviewData.envValidation} />
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Files to be Generated</h3>
                {loadingStackPreview ? (
                  <div className="text-gray-500 animate-pulse py-4">Loading file list...</div>
                ) : stackPreviewData && stackPreviewData.files.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      stackPreviewData.files.reduce((acc, file) => {
                        if (!acc[file.integration]) acc[file.integration] = [];
                        acc[file.integration].push(file.path);
                        return acc;
                      }, {} as Record<string, string[]>)
                    ).map(([integration, paths]) => (
                      <div key={integration}>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {getIntegrationName(integration)}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          {paths.map((path) => (
                            <div key={path} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">📄</span>
                              <code className="text-gray-700">{path}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-4">No files to generate</div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closePreviewModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium"
              >
                Close
              </button>
              <button
                onClick={handleUseStackFromPreview}
                disabled={isStackApplied(previewingStack)}
                className={`px-6 py-2 rounded font-medium ${
                  isStackApplied(previewingStack)
                    ? "bg-purple-100 text-purple-400 cursor-default"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isStackApplied(previewingStack) ? "✓ Stack Applied" : "Use Stack"}
              </button>
            </div>
          </div>
        </div>
      )}

      {upgradePreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>⬆️</span>
                    Upgrade Available
                  </h2>
                  {upgradePreviewModal.preview && (
                    <p className="text-gray-600 text-sm mt-1">
                      {upgradePreviewModal.preview.integrationName}: v{upgradePreviewModal.preview.currentVersion} → v{upgradePreviewModal.preview.latestVersion}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeUpgradePreviewModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {upgradePreviewModal.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-gray-500">Loading upgrade details...</div>
                </div>
              ) : upgradePreviewModal.preview ? (
                <>
                  {upgradePreviewModal.preview.breakingChanges.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-700">
                        <span>⚠️</span>
                        Breaking Changes
                      </h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {upgradePreviewModal.preview.breakingChanges.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-amber-800">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {upgradePreviewModal.preview.migrationNotes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Migration Notes</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {upgradePreviewModal.preview.migrationNotes.map((note, idx) => (
                            <li key={idx} className="text-blue-800 text-sm">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {upgradePreviewModal.preview.diffPreview.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Code Changes Preview</h3>
                      <div className="space-y-4">
                        {upgradePreviewModal.preview.diffPreview.map((diff, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden border">
                            <div className="px-4 py-2 bg-gray-100 border-b flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                diff.type === "added" 
                                  ? "bg-green-100 text-green-700"
                                  : diff.type === "modified"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {diff.type}
                              </span>
                              <code className="text-sm text-gray-700">{diff.file}</code>
                            </div>
                            <div className="p-4 font-mono text-xs overflow-x-auto">
                              {diff.changes.map((line, lineIdx) => (
                                <div
                                  key={lineIdx}
                                  className={`py-0.5 ${
                                    line.startsWith("+")
                                      ? "bg-green-100 text-green-800"
                                      : line.startsWith("-")
                                      ? "bg-red-100 text-red-800"
                                      : ""
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
                    <div className="text-center py-8 text-gray-500">
                      <p>No code changes required for this upgrade.</p>
                      <p className="text-sm mt-2">You can safely apply this upgrade.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Failed to load upgrade details.
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeUpgradePreviewModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={applyUpgrade}
                disabled={upgradePreviewModal.loading || !upgradePreviewModal.preview}
                className={`px-6 py-2 rounded font-medium ${
                  upgradePreviewModal.loading || !upgradePreviewModal.preview
                    ? "bg-blue-100 text-blue-400 cursor-default"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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
