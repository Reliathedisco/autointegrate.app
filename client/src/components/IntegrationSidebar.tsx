import { useState, useEffect } from "react";
import api from "../lib/api";

interface Integration {
  name: string;
  category: string;
  description: string;
  env: string[];
}

interface IntegrationSidebarProps {
  selectedIntegrations: string[];
  onSelectionChange: (integrations: string[]) => void;
  onApply: () => void;
  loading?: boolean;
  recommendedIntegration?: string;
  showTimeSavedHint?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  auth: "🔐",
  payment: "💳",
  database: "🗃️",
  storage: "📦",
  email: "📧",
  ai: "🤖",
  analytics: "📊",
  messaging: "💬",
  scheduling: "⏰",
  devops: "🔧",
  ui: "🎨",
};

export default function IntegrationSidebar({
  selectedIntegrations,
  onSelectionChange,
  onApply,
  loading = false,
  recommendedIntegration,
  showTimeSavedHint = false,
}: IntegrationSidebarProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const res = await api.get("/integrations");
        const data = res.data.integrations || [];
        setIntegrations(data);
        
        // Extract unique categories
        const cats = [...new Set(data.map((i: Integration) => i.category))];
        setCategories(cats as string[]);
        setExpandedCategories(new Set(cats as string[]));
      } catch (err) {
        console.error("Failed to load integrations:", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadIntegrations();
  }, []);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleIntegration = (name: string) => {
    if (selectedIntegrations.includes(name)) {
      onSelectionChange(selectedIntegrations.filter((i) => i !== name));
    } else {
      onSelectionChange([...selectedIntegrations, name]);
    }
  };

  const filteredIntegrations = integrations.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase())
  );

  const integrationsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredIntegrations.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loadingList) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading integrations...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">Integrations</h3>
        <input
          type="text"
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Integration List */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => {
          const categoryIntegrations = integrationsByCategory[category] || [];
          if (categoryIntegrations.length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const selectedInCategory = categoryIntegrations.filter((i) =>
            selectedIntegrations.includes(i.name)
          ).length;

          return (
            <div key={category} className="border-b">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category] || "📦"}</span>
                  <span className="font-medium capitalize">{category}</span>
                  {selectedInCategory > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-sm">
                  {isExpanded ? "▼" : "▶"}
                </span>
              </button>

              {isExpanded && (
                <div className="pb-2">
                  {categoryIntegrations.map((integration) => {
                    const isSelected = selectedIntegrations.includes(integration.name);
                    return (
                      <label
                        key={integration.name}
                        className={`flex items-start gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleIntegration(integration.name)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {integration.name}
                            {integration.name === recommendedIntegration && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                          {integration.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {integration.description}
                            </div>
                          )}
                          {isSelected && integration.env && integration.env.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {integration.env.map((e) => (
                                <span
                                  key={e}
                                  className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                                >
                                  {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600 mb-2">
          {selectedIntegrations.length} integration
          {selectedIntegrations.length !== 1 ? "s" : ""} selected
        </div>
        {showTimeSavedHint && selectedIntegrations.includes("Stripe") && (
          <p className="text-xs text-amber-600 mb-2">
            This integration usually takes ~2 hours to do by hand.
          </p>
        )}
        <button
          onClick={onApply}
          disabled={selectedIntegrations.length === 0 || loading}
          className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span>🚀</span>
              Apply Integrations
            </>
          )}
        </button>
      </div>
    </div>
  );
}
