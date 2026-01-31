import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function Billing() {
  const { user, hasPaid, refreshPaymentStatus, isAuthenticated, getAuthHeaders } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuccess = searchParams.get("success") === "true";
  const isCanceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (isSuccess) {
      navigate("/payment-success", { replace: true });
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (hasPaid && !isSuccess) {
      navigate("/", { replace: true });
    }
  }, [hasPaid, isSuccess, navigate]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        navigate("/?from=payment", { replace: true });
        return;
      }
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
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

  const handleRefresh = async () => {
    setIsLoading(true);
    const isPaid = await refreshPaymentStatus();
    if (isPaid) {
      navigate("/", { replace: true });
    } else {
      setError("No payment found yet. Try again in a moment.");
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Upgrade to Pro</h1>
      <p className="text-gray-500 mb-6">One-time payment. No subscription.</p>

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

        {hasPaid ? (
          <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
            You have Pro access
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Pay $29"}
          </button>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
        )}
      </div>

      {!hasPaid && (
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Already paid? Click to refresh
        </button>
      )}

      <p className="text-center text-gray-400 text-xs mt-4">
        Logged in as {user?.email}
      </p>
    </div>
  );
}
