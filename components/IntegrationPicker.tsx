"use client";

import { useState, useEffect } from "react";

interface Integration {
  name: string;
  category: string;
  description: string;
  env: string[];
  hasWebhook: boolean;
}

interface IntegrationPickerProps {
  selected: string[];
  onSelect: (integrations: string[]) => void;
}

const CATEGORIES = [
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "auth", label: "Authentication", icon: "🔐" },
  { id: "database", label: "Database", icon: "🗄️" },
  { id: "storage", label: "Storage", icon: "📦" },
  { id: "ai", label: "AI / ML", icon: "🤖" },
  { id: "email", label: "Email", icon: "📧" },
  { id: "messaging", label: "Messaging", icon: "💬" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "devtools", label: "DevTools", icon: "🛠️" },
  { id: "realtime", label: "Realtime", icon: "⚡" },
];

export function IntegrationPicker({ selected, onSelect }: IntegrationPickerProps) {
  const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (data.ok) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
    }
  };

  const toggleIntegration = (name: string) => {
    if (selected.includes(name)) {
      onSelect(selected.filter((i) => i !== name));
    } else {
      onSelect([...selected, name]);
    }
  };

  const filteredIntegrations = Object.entries(integrations).filter(
    ([name, info]) => {
      const matchesCategory = !activeCategory || info.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }
  );

  const integrationsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    count: Object.values(integrations).filter((i) => i.category === cat.id).length,
  }));

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          All ({Object.keys(integrations).length})
        </button>
        {integrationsByCategory
          .filter((cat) => cat.count > 0)
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat.icon} {cat.label} ({cat.count})
            </button>
          ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIntegrations.map(([name, info]) => (
          <IntegrationCard
            key={name}
            name={name}
            info={info}
            isSelected={selected.includes(name)}
            onToggle={() => toggleIntegration(name)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No integrations found</p>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  name,
  info,
  isSelected,
  onToggle,
}: {
  name: string;
  info: Integration;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border text-left transition-all ${
        isSelected
          ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500"
          : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{info.name}</h3>
            {info.hasWebhook && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                Webhook
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {info.description}
          </p>
          {info.env.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {info.env.slice(0, 2).map((env) => (
                <span
                  key={env}
                  className="px-2 py-0.5 bg-gray-700/50 text-gray-500 text-xs rounded"
                >
                  {env}
                </span>
              ))}
              {info.env.length > 2 && (
                <span className="px-2 py-0.5 text-gray-500 text-xs">
                  +{info.env.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
            isSelected
              ? "bg-blue-600 border-blue-600"
              : "border-gray-600"
          }`}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
