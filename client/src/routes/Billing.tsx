import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function Billing() {
  const { user, hasPaid, isAuthenticated } = useAuth();
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
        setError("Please sign in first");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold text-claude-text mb-1">Upgrade to Pro</h1>
      <p className="text-claude-text-secondary text-sm mb-6">One-time payment. No subscription.</p>

      {isCanceled && (
        <div className="bg-claude-warning-light text-claude-warning text-sm rounded-lg p-3 mb-4 border border-claude-warning/20">
          Payment canceled. Try again when ready.
        </div>
      )}

      <div className="bg-claude-surface border border-claude-border rounded-xl p-6 mb-4">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-claude-text">$29</div>
          <div className="text-claude-text-tertiary text-sm">one-time</div>
        </div>

        <ul className="space-y-3 mb-6 text-sm text-claude-text">
          <li className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-claude-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited integration jobs
          </li>
          <li className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-claude-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            All templates included
          </li>
          <li className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-claude-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            GitHub PR integration
          </li>
        </ul>

        {hasPaid ? (
          <div className="text-center py-3 bg-claude-success-light text-claude-success rounded-lg text-sm font-medium">
            You have Pro access
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full py-3 bg-claude-primary text-white rounded-lg font-medium hover:bg-claude-primary-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Pay $29"}
          </button>
        )}

        {error && (
          <p className="text-claude-danger text-sm mt-3 text-center">{error}</p>
        )}
      </div>

      <p className="text-center text-claude-text-tertiary text-xs mt-4">
        Logged in as {user?.email}
      </p>
    </div>
  );
}
