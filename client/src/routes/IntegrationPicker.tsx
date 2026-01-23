import { useState, useEffect } from "react";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  env: string[];
  hasWebhook: boolean;
}

export default function IntegrationPicker() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        setIntegrations(data);
        setLoading(false);
      });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/integrations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected }),
      });
      const data = await res.json();
      console.log("Generated files:", data.files);
      alert(`Generated ${data.files.length} files!`);
    } catch (err) {
      console.error("Generation failed:", err);
    }
    setGenerating(false);
  };

  const categories = [...new Set(integrations.map((i) => i.category))];

  if (loading) {
    return <div className="p-8">Loading integrations...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Select Integrations</h1>
        <button
          onClick={generate}
          disabled={selected.length === 0 || generating}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {generating ? "Generating..." : `Generate (${selected.length})`}
        </button>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold capitalize">{category}</h2>
          <div className="grid grid-cols-2 gap-4">
            {integrations
              .filter((i) => i.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`border rounded p-4 cursor-pointer transition-colors ${
                    selected.includes(item.id)
                      ? "border-black bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{item.name}</h3>
                    {selected.includes(item.id) && <span>✓</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  {item.hasWebhook && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
                      Webhook
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Required Environment Variables:</h3>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            {integrations
              .filter((i) => selected.includes(i.id))
              .flatMap((i) => i.env)
              .map((env) => (
                <div key={env}>{env}=</div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
