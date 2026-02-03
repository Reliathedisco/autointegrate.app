import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

type PaymentState = "activating" | "activated";

export default function PaymentSuccess() {
  const [state, setState] = useState<PaymentState>("activating");
  const { setLocalPaidStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      setLocalPaidStatus(true);
      if (mounted) {
        setState("activated");
      }
    }, 600);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [setLocalPaidStatus]);

  const handleGoToDashboard = () => {
    setLocalPaidStatus(true);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center px-4">
        <div className="mb-4">
          <Link to="/?from=payment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Link>
        </div>
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment successful — access unlocked
        </h1>

        <p className="text-gray-600 mb-6">
          AutoIntegrate no longer requires login. Your Pro access is stored locally in this browser.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          {state === "activating" ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700">Finalizing access...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700">Access stored on this device</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGoToDashboard}
          className="inline-block w-full max-w-xs px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg mb-4"
        >
          Go to Dashboard
        </button>

        <p className="text-gray-400 text-sm">
          If you switch browsers or devices, you’ll need to refresh access again.
        </p>
      </div>
    </div>
  );
}
