import { useEffect, useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAuth } from "../hooks/use-auth";

type PaymentState = "verifying" | "verified" | "not_logged_in" | "pending";

export default function PaymentSuccess() {
  const [state, setState] = useState<PaymentState>("verifying");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { isAuthenticated, getAuthHeaders, refreshPaymentStatus } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function checkAuthAndPayment() {
      try {
        if (!isAuthenticated) {
          if (mounted) setState("not_logged_in");
          return { done: true };
        }

        const authHeaders = await getAuthHeaders();
        const res = await fetch("/api/auth/refresh-payment-status", {
          method: "POST",
          headers: authHeaders,
        });

        if (res.status === 401) {
          if (mounted) setState("not_logged_in");
          return { done: true };
        }

        if (res.ok) {
          const data = await res.json();
          if (data.hasPaid) {
            if (mounted) {
              setState("verified");
              // Auto-redirect to dashboard after 2 seconds
              setTimeout(() => {
                window.location.href = "/?from=payment";
              }, 2000);
            }
            return { done: true };
          }
        }
        return { done: false };
      } catch (err) {
        console.error("Error checking payment:", err);
        return { done: false };
      }
    }

    async function poll() {
      for (let i = 0; i < 10; i++) {
        if (!mounted) return;

        const result = await checkAuthAndPayment();
        if (result.done) return;

        await new Promise((r) => setTimeout(r, 2000));
      }

      if (mounted) {
        setState("pending");
      }
    }

    poll();
    return () => { mounted = false; };
  }, [getAuthHeaders, isAuthenticated]);

  const handleGoToDashboard = async () => {
    setActionMessage(null);
    try {
      if (!isAuthenticated) {
        setActionMessage("Please sign in to activate your access.");
        return;
      }
      const isPaid = await refreshPaymentStatus();
      if (isPaid) return (window.location.href = "/?from=payment");
      setActionMessage("We’re still activating your access. Click “Refresh Access” on the Billing page in a moment.");
    } catch {
      setActionMessage("Couldn’t verify access right now. Please try again in a moment.");
    }
  };

  if (state === "not_logged_in") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="mb-4">
            <a href="/?from=payment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to App
            </a>
          </div>
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment successful — you now have access
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment has been received. Now create an account or sign in to apply this purchase to the account you want to use.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              One more step
            </h2>
            <p className="text-blue-700">
              If you already have an account, sign in. If not, create one. Your access will activate automatically (it can take a few seconds).
            </p>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <SignInButton mode="modal">
              <button className="inline-block w-full max-w-xs px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                Create an account
              </button>
            </SignUpButton>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Returning to the app? <a href="/?from=payment" className="text-blue-600 hover:underline">Return to app</a>
          </p>
        </div>
      </div>
    );
  }

  if (state === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="mb-4">
            <a href="/?from=payment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to App
            </a>
          </div>
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment successful — you now have access
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for your purchase! We’re activating your access now (usually under 30 seconds).
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700">Activating your access...</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="inline-block w-full max-w-xs px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg mb-4"
          >
            Go to Dashboard
          </button>

          <p className="text-gray-400 text-sm">
            If you don’t have access yet, wait a moment and try again.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <a href="/?from=payment" className="text-blue-600 hover:underline">Return to app</a>
          </p>
          {actionMessage && (
            <p className="text-gray-600 text-sm mt-3">{actionMessage}</p>
          )}
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="mb-4">
            <a href="/?from=payment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to App
            </a>
          </div>
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment successful — almost done
          </h1>

          <p className="text-gray-600 mb-6">
            We received your payment, but your access hasn’t updated yet. This usually resolves within a minute.
          </p>

          <button
            type="button"
            onClick={() => (window.location.href = "/billing")}
            className="inline-block w-full max-w-xs px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg mb-4"
          >
            Go to Billing (Refresh Access)
          </button>

          <p className="text-gray-500 text-sm">
            <a href="/?from=payment" className="text-blue-600 hover:underline">Return to app</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center px-4">
        <div className="mb-4">
          <a href="/?from=payment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </a>
        </div>
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment successful — you now have access
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your purchase! Your account now has full access to AutoIntegrate.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-semibold">Your account is fully activated</span>
          </div>
          <p className="text-green-700 text-sm">
            All features are unlocked and ready to use.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToDashboard}
          className="inline-block w-full max-w-xs px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg mb-4"
        >
          Go to Dashboard
        </button>

        <p className="text-gray-400 text-sm">
          <a href="/?from=payment" className="text-blue-600 hover:underline">Return to app</a>
        </p>
        {actionMessage && (
          <p className="text-gray-600 text-sm mt-3">{actionMessage}</p>
        )}
      </div>
    </div>
  );
}
