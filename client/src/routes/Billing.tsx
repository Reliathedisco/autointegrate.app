import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

type CheckoutMode = "checkout_session" | "payment_link";

export default function Billing() {
  const { user, hasPaid, refreshPaymentStatus, isAuthenticated, getAuthHeaders } = useAuth();
  const [searchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const isSuccess = searchParams.get("success") === "true";
  const isCanceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (isSuccess) {
      window.location.href = "/payment-success";
    }
  }, [isSuccess]);

  useEffect(() => {
    if (hasPaid && !isSuccess) {
      console.log("[Billing] User is paid, redirecting to dashboard");
      window.location.href = "/";
    }
  }, [hasPaid, isSuccess]);

  const handleCheckout = async () => {
    setIsStartingCheckout(true);
    setCheckoutError(null);
    try {
      if (!isAuthenticated) {
        window.location.href = "/?from=payment";
        return;
      }
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { url?: string; mode?: CheckoutMode; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError(err?.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const handleRefreshAccess = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    
    try {
      const isPaid = await refreshPaymentStatus();
      if (isPaid) {
        setRefreshMessage("Access verified! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setRefreshMessage("No payment found. If you just paid, wait a moment and try again.");
      }
    } catch (error) {
      setRefreshMessage("Error checking payment status. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Unlock Full Access</h1>
      <p className="text-gray-600 mb-8">
        One-time payment. No subscriptions. No recurring charges. Ever.
      </p>

      {isCanceled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">Payment was canceled</p>
          <p className="text-yellow-600 text-sm mt-1">
            No worries! You can try again whenever you're ready.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Pro Access</h2>
          <div className="mt-2 mb-4">
            <span className="text-4xl font-bold">$29</span>
            <span className="text-gray-500"> one-time</span>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          <li className="flex items-start gap-2 text-sm">
            <span className="text-green-500 font-bold">&#10003;</span>
            Unlimited integration jobs
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-green-500 font-bold">&#10003;</span>
            All templates included
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-green-500 font-bold">&#10003;</span>
            Unlimited sandbox sessions
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-green-500 font-bold">&#10003;</span>
            GitHub PR integration
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-green-500 font-bold">&#10003;</span>
            Priority support
          </li>
        </ul>

        {hasPaid ? (
          <div className="text-center py-3 bg-green-100 text-green-700 rounded-lg font-medium">
            &#10003; You have full access
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-medium text-sm mb-1">
                📋 After payment:
              </p>
              <p className="text-blue-700 text-xs">
                You'll be automatically redirected back to the app after completing your payment.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isStartingCheckout}
              className="block w-full py-4 bg-blue-600 text-white text-center rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isStartingCheckout ? "Opening secure checkout..." : "Unlock Access - $29"}
            </button>
            <p className="text-center text-gray-500 text-xs mt-3">
              You'll be redirected to Stripe to complete payment securely.
            </p>
            {checkoutError && (
              <p className="text-center text-red-600 text-sm mt-3">
                {checkoutError}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700 font-medium mb-2">Already paid?</p>
        <p className="text-gray-600 text-sm mb-3">
          If you completed payment but still see this page, click below to refresh your access.
        </p>
        <button
          onClick={handleRefreshAccess}
          disabled={isRefreshing}
          className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? "Checking..." : "Refresh Access"}
        </button>
        {refreshMessage && (
          <p className={`text-sm mt-2 ${refreshMessage.includes("verified") ? "text-green-600" : "text-gray-600"}`}>
            {refreshMessage}
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Secure payment via Stripe. Your payment is linked to your account automatically.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Logged in as: {user?.email || user?.firstName || "Unknown"}
        </p>
      </div>
    </div>
  );
}
