"use client";

import { useState } from "react";

type Block = {
  id: string;
  label: string;
  icon: string;
  category: string;
};

const blocks: Block[] = [
  { id: "stripe", label: "Stripe Payment", icon: "💳", category: "Payment" },
  { id: "resend", label: "Send Email", icon: "📧", category: "Email" },
  { id: "github", label: "GitHub Action", icon: "🐙", category: "DevTools" },
  { id: "ai", label: "AI Task", icon: "🤖", category: "AI" },
  { id: "webhook", label: "Webhook", icon: "🔗", category: "Integration" },
  { id: "slack", label: "Slack Message", icon: "💬", category: "Messaging" },
];

export default function Composer() {
  const [flow, setFlow] = useState<Block[]>([]);

  const add = (block: Block) => {
    setFlow((prev) => [...prev, { ...block, id: `${block.id}-${Date.now()}` }]);
  };

  const remove = (index: number) => {
    setFlow((prev) => prev.filter((_, i) => i !== index));
  };

  const exportFlow = () => {
    console.log("Exported flow:", flow);
    alert("Flow exported to console!");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Integration Composer</h1>
        <button
          onClick={exportFlow}
          disabled={flow.length === 0}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Export Flow
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Palette */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-600">Available Blocks</h2>
          {blocks.map((b) => (
            <div
              key={b.id}
              onClick={() => add(b)}
              className="cursor-pointer p-3 border rounded hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <span className="mr-2">{b.icon}</span>
              {b.label}
              <span className="text-xs text-gray-400 ml-2">({b.category})</span>
            </div>
          ))}
        </div>

        {/* Flow */}
        <div className="col-span-2 border p-4 rounded-lg bg-gray-50 min-h-[400px]">
          <h2 className="font-semibold text-gray-600 mb-4">Your Flow</h2>
          
          {flow.length === 0 && (
            <p className="text-gray-400 text-center py-10">
              Click blocks on the left to add them to your flow
            </p>
          )}
          
          <div className="space-y-3">
            {flow.map((b, i) => (
              <div key={b.id} className="flex items-center">
                {i > 0 && (
                  <div className="w-8 flex justify-center">
                    <div className="h-6 border-l-2 border-gray-300" />
                  </div>
                )}
                <div className="flex-1 flex items-center justify-between border bg-white p-3 rounded shadow-sm">
                  <div>
                    <span className="mr-2">{b.icon}</span>
                    {b.label}
                  </div>
                  <button
                    onClick={() => remove(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
