import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAuth } from "../hooks/use-auth";

interface AuthGuardProps {
  children: (showBilling: boolean) => ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { hasPaid, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isFromPayment = location.search.includes("from=payment");

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto px-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">AutoIntegrate</h1>

          {isFromPayment && (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4 text-center">
              Payment received! Sign in to continue.
            </div>
          )}

          <p className="text-gray-500 text-center text-sm mb-6">
            Add API integrations to your projects in minutes.
          </p>

          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Create Account
              </button>
            </SignUpButton>
          </div>

          <p className="text-gray-400 text-xs text-center mt-4">
            Google, GitHub, or email
          </p>
        </div>
      </div>
    );
  }

  // Unpaid users go to Billing
  if (!hasPaid && location.pathname !== "/billing") {
    return <Navigate to="/billing" replace />;
  }

  return <>{children(!hasPaid)}</>;
}
