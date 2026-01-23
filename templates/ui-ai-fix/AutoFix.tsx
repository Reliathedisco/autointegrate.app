"use client";
import { useState } from "react";

export default function AutoFix() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runFix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input }),
      });
      const data = await res.json();
      setResult(data.fixed);
    } catch (err) {
      setResult("Error fixing code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold">AI Auto-Fix</h2>
      
      <textarea
        className="border p-3 w-full h-40 font-mono text-sm rounded"
        placeholder="Paste broken code here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={runFix}
        disabled={loading || !input}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Fixing..." : "Auto-Fix"}
      </button>

      {result && (
        <div>
          <h3 className="font-medium mb-2">Fixed Code:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
