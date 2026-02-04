import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Billing() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCanceled = searchParams.get("canceled") === "true";

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Support AutoIntegrate</h1>
      <p className="text-gray-500 mb-6">One-time payment. No account required.</p>

      {isCanceled && (
        <div className="bg-yellow-50 text-yellow-700 text-sm rounded-lg p-3 mb-4">
          Payment canceled. Try again when ready.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900">$29</div>
          <div className="text-gray-500 text-sm">one-time</div>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span>
            Unlimited integration jobs
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span>
            All templates included
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span>
            GitHub PR integration
          </li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Pay $29"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
        )}
      </div>

      <p className="text-center text-gray-400 text-xs mt-4">
        You can continue using AutoIntegrate immediately after checkout.
      </p>
    </div>
  );
}
